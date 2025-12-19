import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, deleteDoc, collectionData, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritosService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // 1. AGREGAR FAVORITO
  async agregarFavorito(favorito: any) {
    const user = this.auth.currentUser;
    // Validación de seguridad
    if (!user) throw new Error('Debes iniciar sesión para agregar favoritos.');

    // Creamos la referencia a la colección 'favoritos'
    const ref = collection(this.firestore, 'favoritos');
    
    // Guardamos el documento con el UID del usuario
    return addDoc(ref, {
      uid: user.uid,
      ...favorito
    });
  }

  // 2. OBTENER FAVORITOS (Del usuario actual)
  getFavoritosDelUsuario(uid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'favoritos');
    // Filtramos solo los que pertenezcan a este usuario
    const q = query(ref, where('uid', '==', uid));
    
    // 'idField' agrega automáticamente el ID del documento de Firebase al objeto
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  // 3. ELIMINAR FAVORITO
  eliminarFavorito(id: string) {
    // Referencia al documento específico por su ID
    const ref = doc(this.firestore, `favoritos/${id}`);
    return deleteDoc(ref);
  }
}