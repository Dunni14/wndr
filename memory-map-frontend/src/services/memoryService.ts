import { supabase } from '../lib/supabase'
import type { Memory } from '../lib/supabase'

export const memoryService = {
  // Get all memories for the current user
  async getUserMemories(): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create a new memory
  async createMemory(memory: {
    title: string
    description?: string
    mood?: string
    latitude: number
    longitude: number
    image_url?: string
    visit_date: string
  }): Promise<Memory> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('memories')
      .insert({
        ...memory,
        user_id: user.id,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a memory
  async updateMemory(id: string, updates: {
    title?: string
    description?: string
    mood?: string
    image_url?: string
    visit_date?: string
  }): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a memory
  async deleteMemory(id: string): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Upload image to Supabase storage
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `memory-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('memories')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}