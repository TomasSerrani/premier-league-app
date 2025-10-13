import { Injectable, inject } from '@angular/core';
import {Auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateEmail, updatePassword, deleteUser, sendEmailVerification, User} from '@angular/fire/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

 constructor(private firestore: Firestore) {
  onAuthStateChanged(this.auth, (user) => {
    console.log('Cambio de estado en Firebase:', user);
    this.currentUserSubject.next(user ?? null);
  });
}

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  get currentUser() {
    return this.auth.currentUser;
  }
   async updateUserName(name: string) {
    if (!this.auth.currentUser) return;
    await updateProfile(this.auth.currentUser, { displayName: name });

    // también en Firestore
    const ref = doc(this.firestore, `users/${this.auth.currentUser.uid}`);
    await updateDoc(ref, { name });
  }

  async updateUserEmail(newEmail: string) {
    if (!this.auth.currentUser) return;
    await updateEmail(this.auth.currentUser, newEmail);

    const ref = doc(this.firestore, `users/${this.auth.currentUser.uid}`);
    await updateDoc(ref, { email: newEmail });
  }

  async updateUserPassword(newPassword: string) {
    if (!this.auth.currentUser) return;
    await updatePassword(this.auth.currentUser, newPassword);
  }

  async updateUserPhoto(photoURL: string) {
    if (!this.auth.currentUser) return;
    await updateProfile(this.auth.currentUser, { photoURL });

    const ref = doc(this.firestore, `users/${this.auth.currentUser.uid}`);
    await updateDoc(ref, { photoURL });
  }

  async deleteAccount() {
    if (!this.auth.currentUser) return;
    await deleteUser(this.auth.currentUser);
  }
  async enviarVerificacion() {
  const user = this.auth.currentUser;
  if (!user) return alert('No hay usuario autenticado');

  try {
    await sendEmailVerification(user);
    alert('📧 Se envió un correo de verificación. Por favor verifícalo antes de cambiar el email.');
  } catch (error: any) {
    console.error(error);
    alert('❌ Error al enviar correo de verificación: ' + error.message);
  }
}
}
