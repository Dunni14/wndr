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
        
        // Create user profile when user signs in (including after email confirmation)
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await createUserProfile(session.user)
          } catch (error) {
            console.error('Error creating user profile during auth change:', error)
          }
        }
        
        setLoading(false)
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
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
        }, {
          onConflict: 'id'
        })
        .select()
      
      if (profileError) {
        console.error('Error creating user profile:', profileError)
      } else {
        console.log('User profile created/updated successfully')
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
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