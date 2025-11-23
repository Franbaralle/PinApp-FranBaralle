import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  DocumentReference,
  onSnapshot,
  query,
  where,
  getDocs,
  QuerySnapshot,
  DocumentData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  constructor(private firestore: Firestore) {}

  getClientes(): Observable<Cliente[]> {
    return new Observable(subscriber => {
      const clientesCollection = collection(this.firestore, 'clientes');
      const clientesQuery = query(clientesCollection);
      
      const unsubscribe = onSnapshot(clientesQuery, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const clientes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              fechaNacimiento: data['fechaNacimiento']?.toDate ? data['fechaNacimiento'].toDate() : data['fechaNacimiento'],
              fechaRegistro: data['fechaRegistro']?.toDate ? data['fechaRegistro'].toDate() : data['fechaRegistro']
            } as Cliente;
          });
          subscriber.next(clientes);
        },
        (error) => {
          subscriber.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  getCliente(id: string): Observable<Cliente> {
    return new Observable(subscriber => {
      const clienteDoc = doc(this.firestore, `clientes/${id}`);
      
      const unsubscribe = onSnapshot(clienteDoc,
        (snapshot) => {
          if (snapshot.exists()) {
            subscriber.next({
              id: snapshot.id,
              ...snapshot.data()
            } as Cliente);
          }
        },
        (error) => {
          subscriber.error(error);
        }
      );

      return () => unsubscribe();
    });
  }

  async addCliente(cliente: Cliente): Promise<DocumentReference> {
    const clientesCollection = collection(this.firestore, 'clientes');
    const clienteData = {
      ...cliente,
      fechaRegistro: new Date()
    };
    return await addDoc(clientesCollection, clienteData);
  }

  async getClienteByDni(dni: string): Promise<Cliente | null> {
    const clientesCollection = collection(this.firestore, 'clientes');
    const q = query(clientesCollection, where('dni', '==', dni));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      fechaNacimiento: data['fechaNacimiento']?.toDate ? data['fechaNacimiento'].toDate() : data['fechaNacimiento'],
      fechaRegistro: data['fechaRegistro']?.toDate ? data['fechaRegistro'].toDate() : data['fechaRegistro']
    } as Cliente;
  }

  async updateCliente(id: string, cliente: Partial<Cliente>): Promise<void> {
    const clienteDoc = doc(this.firestore, `clientes/${id}`);
    return await updateDoc(clienteDoc, { ...cliente });
  }

  async deleteCliente(id: string): Promise<void> {
    const clienteDoc = doc(this.firestore, `clientes/${id}`);
    return await deleteDoc(clienteDoc);
  }
}
