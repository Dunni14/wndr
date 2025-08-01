import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<any>
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (data: { name?: string; email?: string }) => Promise<any>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Safety timeout to prevent endless loading
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
      clearTimeout(loadingTimeout)
      console.log('Initial session loaded:', { user: session?.user?.id, error })
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      if (!mounted) return
      
      clearTimeout(loadingTimeout)
      console.error('Error getting initial session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Set loading to false immediately to unblock the UI
        setLoading(false)
        
        // Create user profile when user signs in (non-blocking)
        if (event === 'SIGNED_IN' && session?.user) {
          // Run profile creation in background without blocking
          createUserProfile(session.user).catch(error => {
            console.error('Background user profile creation failed:', error)
          })
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // Helper function to create user profile
  const createUserProfile = async (user: any) => {
    try {
      console.log('Creating user profile for:', user.id)
      
      const { data, error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
        }, {
          onConflict: 'id'
        })
      
      if (profileError) {
        console.error('Error creating user profile:', profileError)
        throw profileError
      } else {
        console.log('User profile created/updated successfully:', data)
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      // Don't throw the error - we don't want to block the auth flow
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    // Always use the current origin, which will be the Vercel URL in production
    const redirectUrl = `${window.location.origin}/login`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        },
        emailRedirectTo: redirectUrl
      }
    })
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: { name?: string; email?: string }) => {
    if (!user) throw new Error('No user')
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
    
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}