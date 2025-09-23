import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, getDocs, deleteDoc, doc, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async agregarFavorito(team: any): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const equipoId = String(team.team.id); 
    const favoritosRef = collection(this.firestore, 'favoritos');

    const q = query(
      favoritosRef,
      where('uid', '==', user.uid),
      where('equipoId', '==', equipoId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(favoritosRef, {
        uid: user.uid,
        equipoId,
        nombreEquipo: team.team.name,
        logoEquipo: team.team.logo,
        createdAt: new Date()
      });
    } else {
      console.log('⚠️ El equipo ya está en favoritos');
    }
  }

  getFavoritosDelUsuario(uid: string): Observable<any[]> {
    const favoritosRef = collection(this.firestore, 'favoritos');
    const q = query(favoritosRef, where('uid', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  eliminarFavorito(id: string) {
    const ref = doc(this.firestore, `favoritos/${id}`);
    return deleteDoc(ref);
  }
}