import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, doc, deleteDoc, updateDoc, collectionData, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartidosService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async guardarPartido(partido: any) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');
    const ref = collection(this.firestore, 'partidosGuardados');
    await addDoc(ref, {
      uid: user.uid,
      ...partido
    });
  }

  getPartidosGuardados(uid: string): Observable<any[]> {
    const ref = collection(this.firestore, 'partidosGuardados');
    const q = query(ref, where('uid', '==', uid));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  updatePartido(id: string, data: any) {
    const ref = doc(this.firestore, `partidosGuardados/${id}`);
    return updateDoc(ref, data);
  }

  eliminarPartido(id: string) {
    const ref = doc(this.firestore, `partidosGuardados/${id}`);
    return deleteDoc(ref);
  }
}
