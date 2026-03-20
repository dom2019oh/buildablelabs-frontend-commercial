import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function saveOnboardingAnswers(
  answers: Record<string, string>,
  completed: boolean,
  skipped: boolean,
) {
  const user = auth.currentUser;
  if (!user) throw new Error('No user found');

  await setDoc(doc(db, 'onboarding', user.uid), {
    q1: answers.q1 ?? null,
    q2: answers.q2 ?? null,
    q3: answers.q3 ?? null,
    q4: answers.q4 ?? null,
    q5: answers.q5 ?? null,
    completed,
    skipped,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // Update display name in users collection if provided
  if (answers.q1 && completed) {
    await setDoc(doc(db, 'users', user.uid), {
      displayName: answers.q1,
      email: user.email,
      avatarUrl: user.photoURL ?? null,
    }, { merge: true });
  }
}
