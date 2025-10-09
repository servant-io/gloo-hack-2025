import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const SESSION_USER_ID = 'demo-user-session';

export interface CreditState {
  creditsRemaining: number;
  totalCreditsEarned: number;
  loading: boolean;
  error: string | null;
}

export function useCredits() {
  const [state, setState] = useState<CreditState>({
    creditsRemaining: 5,
    totalCreditsEarned: 5,
    loading: true,
    error: null,
  });

  // Initialize or fetch user credits
  useEffect(() => {
    async function initializeCredits() {
      try {
        // Check if user credits exist
        const { data: existing, error: fetchError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', SESSION_USER_ID)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
          // User exists, use their credits
          setState({
            creditsRemaining: existing.credits_remaining,
            totalCreditsEarned: existing.total_credits_earned,
            loading: false,
            error: null,
          });
        } else {
          // Create new user with 5 free credits
          const { data: newUser, error: insertError } = await supabase
            .from('user_credits')
            .insert({
              user_id: SESSION_USER_ID,
              credits_remaining: 5,
              total_credits_earned: 5,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          setState({
            creditsRemaining: newUser.credits_remaining,
            totalCreditsEarned: newUser.total_credits_earned,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Error initializing credits:', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load credits',
        }));
      }
    }

    initializeCredits();
  }, []);

  // Deduct credits when watching premium content
  const deductCredit = useCallback(
    async (contentId: string): Promise<boolean> => {
      if (state.creditsRemaining <= 0) {
        setState((prev) => ({ ...prev, error: 'No credits remaining' }));
        return false;
      }

      try {
        const newCredits = state.creditsRemaining - 1;

        // Update credits in database
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({ credits_remaining: newCredits })
          .eq('user_id', SESSION_USER_ID);

        if (updateError) throw updateError;

        // Record watch history
        await supabase.from('watch_history').insert({
          user_id: SESSION_USER_ID,
          content_id: contentId,
          credits_used: 1,
          completed: false,
        });

        // Update local state
        setState((prev) => ({
          ...prev,
          creditsRemaining: newCredits,
          error: null,
        }));

        return true;
      } catch (err) {
        console.error('Error deducting credit:', err);
        setState((prev) => ({ ...prev, error: 'Failed to deduct credit' }));
        return false;
      }
    },
    [state.creditsRemaining]
  );

  // Add credits (for future purchase feature)
  const addCredits = useCallback(
    async (amount: number) => {
      try {
        const newCredits = state.creditsRemaining + amount;
        const newTotal = state.totalCreditsEarned + amount;

        const { error } = await supabase
          .from('user_credits')
          .update({
            credits_remaining: newCredits,
            total_credits_earned: newTotal,
          })
          .eq('user_id', SESSION_USER_ID);

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          creditsRemaining: newCredits,
          totalCreditsEarned: newTotal,
          error: null,
        }));
      } catch (err) {
        console.error('Error adding credits:', err);
        setState((prev) => ({ ...prev, error: 'Failed to add credits' }));
      }
    },
    [state.creditsRemaining, state.totalCreditsEarned]
  );

  return {
    ...state,
    deductCredit,
    addCredits,
    hasCredits: state.creditsRemaining > 0,
  };
}
