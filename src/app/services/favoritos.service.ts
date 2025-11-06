import { Injectable, inject, NgZone } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, query, where, getDocs, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private zone = inject(NgZone);

  async agregarFavorito(team: any) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');

    const favRef = collection(this.firestore, `users/${uid}/favoritos`);
    const q = query(favRef, where('equipoId', '==', String(team.team.id)));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return;

    await addDoc(favRef, {
      equipoId: String(team.team.id),
      nombreEquipo: team.team.name,
      logoEquipo: team.team.logo,
      createdAt: new Date()
    });
  }

  eliminarFavorito(id: string) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    const favDoc = doc(this.firestore, `users/${uid}/favoritos/${id}`);
    return deleteDoc(favDoc);
  }

  getFavoritosDelUsuario(uid: string): Observable<any[]> {
    const favRef = collection(this.firestore, `users/${uid}/favoritos`);
    return collectionData(favRef, { idField: 'id' });
  }
}
