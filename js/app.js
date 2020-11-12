// Variables y Selectores
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");

//Eventos
eventListeners();
function eventListeners() {
  document.addEventListener("DOMContentLoaded", preguntarPresupuesto);
  formulario.addEventListener("submit", agregarGasto);
}

//Clases

class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularRestante();
  }

  calcularRestante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
    this.calcularRestante();
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    //Extraer Valor
    const { presupuesto, restante } = cantidad;
    //Agregar al html
    document.querySelector("#total").textContent = presupuesto;
    document.querySelector("#restante").textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    //crear div alerta
    const divMensaje = document.createElement("div");
    divMensaje.classList.add("text-center", "alert");

    if (tipo === "error") {
      divMensaje.classList.add("alert-danger");
    } else {
      divMensaje.classList.add("alert-success");
    }

    //Mensaje de error
    divMensaje.textContent = mensaje;

    //Insertamos en el html
    document.querySelector(".primario").insertBefore(divMensaje, formulario);

    //Quita del HTML
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }

  mostrarGastos(gastos) {
    this.limpiarHTML(); //Elimina el html previo

    //Iterar sobre los gastos
    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;

      //Crear li
      const nuevoGasto = document.createElement("li");
      nuevoGasto.className =
        "list-group-item d-flex justify-content-between align-items-center";
      //nuevoGasto.setAttribute('data-id', id); //en versiones anteriores se usa esta forma para añadir atributos
      nuevoGasto.dataset.id = id; //version moderna de agregar atributos en js

      //Agregar el html del gasto
      nuevoGasto.innerHTML = ` ${nombre}<span class="badge-primary badge-pill">$ ${cantidad}</span>`;

      //Boton para borrar el gasto
      const btnBorrar = document.createElement("button");
      btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
      btnBorrar.innerHTML = "Borrar &times";
      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };

      nuevoGasto.appendChild(btnBorrar);
      //Agregar al HTML

      gastoListado.appendChild(nuevoGasto);
    });
  }

  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }

  actualizarRestante(restante) {
    document.querySelector("#restante").textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;

    const restanteDiv = document.querySelector(".restante");

    //Comprobar 25%
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove("alert-success", "alert-warning");
      restanteDiv.classList.add("alert-danger");
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove("alert-success");
      restanteDiv.classList.add("alert-warning");
    } else {
      restanteDiv.classList.remove("alert-danger", "alert-warning");
      restanteDiv.classList.add("alert-success");
    }

    //Si el total es 0 o menos
    if (restante <= 0) {
      ui.imprimirAlerta("El presupuesto se ha agotado", "error");
      formulario.querySelector('button[type="submit"]').disabled = true;
    }
  }
}

//Instanciar
const ui = new UI();

let presupuesto;

//Funciones

function preguntarPresupuesto() {
  const presupuestoUsuario = prompt("¿Cual es tu presupuesto?");

  // console.log(Number(presupuestoUsuario));
  if (
    presupuestoUsuario === "" ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload();
  }

  //presupuesto valido

  presupuesto = new Presupuesto(presupuestoUsuario);
  console.log(presupuesto);
  ui.insertarPresupuesto(presupuesto);
}

//Añadir Gasto

function agregarGasto(e) {
  e.preventDefault();

  //leer datos formulario
  const nombre = document.querySelector("#gasto").value;
  const cantidad = Number(document.querySelector("#cantidad").value);

  //Validar
  if (nombre === "" || cantidad === "") {
    ui.imprimirAlerta("Ambos campos son obligatorios", "error");
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta("Cantidad no válida", "error");
    return;
  }

  //Gerar objeto con el gasto
  const gasto = { nombre, cantidad, id: Date.now() }; //contrario a destructuring

  //añade un nuevo gasto
  presupuesto.nuevoGasto(gasto);
  //mensaje de todo ok
  ui.imprimirAlerta("Gasto agregado Correctamente");

  //Imprimir los gastos
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);
  //reinicia el formulario
  formulario.reset();
}

function eliminarGasto(id) {
  //elimina del objeto
  presupuesto.eliminarGasto(id);

  //Elimina los gastos del html
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);

  ui.comprobarPresupuesto(presupuesto);
}
