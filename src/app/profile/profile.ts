import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import {
  Auth,
  updateProfile,
  updatePassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail 
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  name = '';
  email = '';
  password = '';
  photoURL = '';

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    public auth: Auth,
    private router: Router,
    private storage: Storage
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser;

    if (!user) {
      alert('Debes iniciar sesión para acceder al perfil.');
      this.router.navigate(['/login']);
      return;
    }

    this.name = user.displayName || '';
    this.email = user.email || '';
    this.photoURL = user.photoURL || '';

    if (!user.emailVerified) {
      const confirmar = confirm(
        'Tu correo aún no está verificado. ¿Deseas enviar el correo de verificación ahora?'
      );
      if (confirmar) {
        this.enviarVerificacion();
      }
    }
  }

  async enviarVerificacion() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('No hay un usuario autenticado.');
      return;
    }

    try {
      await sendEmailVerification(user);
      alert('✅ Se envió un correo de verificación. Revisá tu bandeja de entrada.');
    } catch (error: any) {
      console.error('Error al enviar verificación:', error);
      alert('❌ Error al enviar verificación: ' + error.message);
    }
  }

  async reauthenticateUser(currentPassword: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user || !user.email) return false;

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      console.log('Usuario reautenticado correctamente.');
      return true;
    } catch (error: any) {
      console.error('Error al reautenticar:', error);
      alert('❌ Contraseña incorrecta. No se pudo reautenticar.');
      return false;
    }
  }

  
  async guardarCambios() {
    const user = this.auth.currentUser;
    if (!user) {
      alert('No hay un usuario autenticado.');
      return;
    }

    try {
     
    if (this.email && this.email !== user.email) {

  if (!user.emailVerified) {
    alert('⚠️ Verifica tu correo actual antes de cambiar el email.');
    await this.enviarVerificacion();
    return;
  }

  const confirmar = confirm(`¿Deseas cambiar tu correo a ${this.email}?`);
  if (!confirmar) return;

  const currentPassword = prompt('Por seguridad, ingresa tu contraseña actual:');
  if (!currentPassword) return;

  const reauth = await this.reauthenticateUser(currentPassword);
  if (!reauth) return;

  try {

    await verifyBeforeUpdateEmail(user, this.email);

    alert(
      `📧 Se envió un correo de verificación a ${this.email}. 
Por favor haz clic en el enlace para confirmar el cambio.`
    );

    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    await updateDoc(userDocRef, {
      pendingEmail: this.email,
      updatedAt: new Date(),
    });


    await this.auth.signOut();
    this.router.navigate(['/login']);
    return;
  } catch (error: any) {
    console.error('Error al enviar verificación del nuevo email:', error);
    alert('❌ No se pudo enviar la verificación: ' + error.message);
    return;
  } 
      }
      if (this.name || this.photoURL) {
        await updateProfile(user, {
          displayName: this.name || user.displayName,
          photoURL: this.photoURL || user.photoURL,
        });
      }
if (this.password) {
  const confirmar = confirm('¿Deseas cambiar tu contraseña?');
  if (!confirmar) return;

  const currentPassword = prompt('🔒 Ingresa tu contraseña actual para confirmar el cambio:');
  if (!currentPassword) return;

  const reauth = await this.reauthenticateUser(currentPassword);
  if (!reauth) return;

  try {
    await updatePassword(user, this.password);
    alert('✅ Contraseña actualizada correctamente. Por seguridad, vuelve a iniciar sesión.');

 
    await this.auth.signOut();
    this.router.navigate(['/login']);
    return;
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    alert('❌ No se pudo actualizar la contraseña: ' + error.message);
    return;
  }
}
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userDocRef, {
        name: this.name || user.displayName || '',
        email: this.email || user.email || '',
        photoURL: this.photoURL || user.photoURL || '',
        updatedAt: new Date(),
      });

      alert('✅ Cambios guardados correctamente.');
    } catch (error: any) {
      console.error('Error al actualizar el perfil:', error);
      alert('❌ Error al actualizar el perfil: ' + error.message);
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    const user = this.auth.currentUser;

    if (!user || !file) return;

    try {
      const filePath = `profile_photos/${user.uid}_${file.name}`;
      const fileRef = ref(this.storage, filePath);

      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);

      await updateProfile(user, { photoURL });
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userDocRef, { photoURL });

      this.photoURL = photoURL; 
      alert('✅ Foto actualizada correctamente.');
    } catch (error: any) {
      console.error(error);
      alert('❌ Error al subir la foto: ' + error.message);
    }
  }

  deleteAccount() {
    if (confirm('⚠️ ¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      this.authService
        .deleteAccount()
        .then(() => alert('Cuenta eliminada correctamente.'))
        .catch((err) => alert('Error: ' + err.message));
    }
  }
}
