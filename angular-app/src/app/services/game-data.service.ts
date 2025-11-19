import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import ingredientesData from '../../assets/images/ingredientes/ingredientes-data.json';

export interface Ingrediente {
  id: number;
  nombre: string;
  imagen: string;
  categoria: string;
  unidad: string;
  porcionDefault: number;
}

export interface PersonajeSintetico {
  id: number;
  tipo: string;
  edad_rango: string;
  sexo: string;
  imagen: string;
  nombre: string;
  estado?: 'pendiente' | 'en_curso' | 'servido';
}

export interface ComponenteServido {
  componente_id: number;
  nombre: string;
  cantidad_gramos: number;
  imagen?: string;
}

export interface Decision {
  sesion_id: number;
  escenario: 'desayuno' | 'almuerzo' | 'cena';
  personaje_tipo: string;
  personaje_edad_rango: string;
  personaje_sexo: string;
  plato_id?: number;
  bebida_id?: number;
  componentes_servidos: ComponenteServido[];
  tiempo_decision_ms: number;
  orden_servicio: number;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  // Personajes sintéticos hardcoded
  private personajes: PersonajeSintetico[] = [
    { id: 1, tipo: 'niño', edad_rango: '6-11', sexo: 'M', imagen: 'niño.png', nombre: 'Niño (6-11 años)' },
    { id: 2, tipo: 'niña', edad_rango: '6-11', sexo: 'F', imagen: 'niño.png', nombre: 'Niña (6-11 años)' },
    { id: 3, tipo: 'adolescente_hombre', edad_rango: '12-17', sexo: 'M', imagen: 'niño.png', nombre: 'Adolescente Hombre (12-17 años)' },
    { id: 4, tipo: 'adolescente_mujer', edad_rango: '12-17', sexo: 'F', imagen: 'niño.png', nombre: 'Adolescente Mujer (12-17 años)' },
    { id: 5, tipo: 'adulto_joven_hombre', edad_rango: '18-25', sexo: 'M', imagen: 'niño-comiendo.png', nombre: 'Adulto Joven Hombre (18-25 años)' },
    { id: 6, tipo: 'adulto_joven_mujer', edad_rango: '18-25', sexo: 'F', imagen: 'niño-comiendo.png', nombre: 'Adulto Joven Mujer (18-25 años)' },
    { id: 7, tipo: 'adulto_hombre', edad_rango: '30-50', sexo: 'M', imagen: 'niño-cubierto-plato.png', nombre: 'Adulto Hombre (30-50 años)' },
    { id: 8, tipo: 'adulto_mujer', edad_rango: '30-50', sexo: 'F', imagen: 'niño-cubierto-plato.png', nombre: 'Adulto Mujer (30-50 años)' }
  ];

  // BehaviorSubjects para estado del juego
  private escenarioActualSubject = new BehaviorSubject<'desayuno' | 'almuerzo' | 'cena'>('desayuno');
  private personajeActualSubject = new BehaviorSubject<PersonajeSintetico | null>(null);
  private personajesSubject = new BehaviorSubject<PersonajeSintetico[]>(this.resetearPersonajes());
  private decisionesTemporalesSubject = new BehaviorSubject<Decision[]>([]);
  private ingredientesSubject = new BehaviorSubject<Ingrediente[]>([]);
  private tiempoInicioDecisionSubject = new BehaviorSubject<number>(0);
  private ordenServicioSubject = new BehaviorSubject<number>(1);

  // Observables públicos
  public escenarioActual$ = this.escenarioActualSubject.asObservable();
  public personajeActual$ = this.personajeActualSubject.asObservable();
  public personajes$ = this.personajesSubject.asObservable();
  public decisionesTemporales$ = this.decisionesTemporalesSubject.asObservable();
  public ingredientes$ = this.ingredientesSubject.asObservable();

  constructor() {
    // Cargar ingredientes del JSON
    this.cargarIngredientes();
  }

  private cargarIngredientes(): void {
    this.ingredientesSubject.next(ingredientesData.ingredientes);
  }

  private resetearPersonajes(): PersonajeSintetico[] {
    return this.personajes.map(p => ({ ...p, estado: 'pendiente' }));
  }

  // ===================================
  // GESTIÓN DE ESCENARIOS
  // ===================================

  setEscenario(escenario: 'desayuno' | 'almuerzo' | 'cena'): void {
    this.escenarioActualSubject.next(escenario);
    this.personajesSubject.next(this.resetearPersonajes());
    this.ordenServicioSubject.next(1);
  }

  getEscenarioActual(): 'desayuno' | 'almuerzo' | 'cena' {
    return this.escenarioActualSubject.value;
  }

  siguienteEscenario(): void {
    const actual = this.getEscenarioActual();
    const escenarios: Array<'desayuno' | 'almuerzo' | 'cena'> = ['desayuno', 'almuerzo', 'cena'];
    const indice = escenarios.indexOf(actual);
    if (indice < escenarios.length - 1) {
      this.setEscenario(escenarios[indice + 1]);
    }
  }

  // ===================================
  // GESTIÓN DE PERSONAJES
  // ===================================

  getPersonajes(): PersonajeSintetico[] {
    return this.personajesSubject.value;
  }

  setPersonajeActual(personaje: PersonajeSintetico): void {
    // Marcar personaje como en curso
    const personajes = this.personajesSubject.value.map(p => 
      p.id === personaje.id ? { ...p, estado: 'en_curso' as const } : p
    );
    this.personajesSubject.next(personajes);
    this.personajeActualSubject.next(personaje);
    this.iniciarTiempoDecision();
  }

  marcarPersonajeServido(personajeId: number): void {
    const personajes = this.personajesSubject.value.map(p => 
      p.id === personajeId ? { ...p, estado: 'servido' as const } : p
    );
    this.personajesSubject.next(personajes);
  }

  obtenerSiguientePersonaje(): PersonajeSintetico | null {
    const pendientes = this.personajesSubject.value.filter(p => p.estado === 'pendiente');
    return pendientes.length > 0 ? pendientes[0] : null;
  }

  // ===================================
  // GESTIÓN DE DECISIONES
  // ===================================

  iniciarTiempoDecision(): void {
    this.tiempoInicioDecisionSubject.next(Date.now());
  }

  calcularTiempoDecision(): number {
    const inicio = this.tiempoInicioDecisionSubject.value;
    return Date.now() - inicio;
  }

  agregarDecisionTemporal(decision: Decision): void {
    const decisiones = [...this.decisionesTemporalesSubject.value, decision];
    this.decisionesTemporalesSubject.next(decisiones);
    this.ordenServicioSubject.next(this.ordenServicioSubject.value + 1);
  }

  obtenerDecisionesTemporales(): Decision[] {
    return this.decisionesTemporalesSubject.value;
  }

  limpiarDecisionesTemporales(): void {
    this.decisionesTemporalesSubject.next([]);
  }

  getOrdenServicioActual(): number {
    return this.ordenServicioSubject.value;
  }

  // ===================================
  // GESTIÓN DE INGREDIENTES
  // ===================================

  getIngredientes(): Ingrediente[] {
    return this.ingredientesSubject.value;
  }

  getIngredientesByCategoria(categoria: string): Ingrediente[] {
    return this.ingredientesSubject.value.filter(i => i.categoria === categoria);
  }

  getIngredienteById(id: number): Ingrediente | undefined {
    return this.ingredientesSubject.value.find(i => i.id === id);
  }

  // ===================================
  // UTILIDADES
  // ===================================

  resetearJuego(): void {
    this.setEscenario('desayuno');
    this.personajeActualSubject.next(null);
    this.limpiarDecisionesTemporales();
    this.ordenServicioSubject.next(1);
  }

  esUltimoEscenario(): boolean {
    return this.getEscenarioActual() === 'cena';
  }

  todosLosPersonajesServidos(): boolean {
    return this.personajesSubject.value.every(p => p.estado === 'servido');
  }
}
