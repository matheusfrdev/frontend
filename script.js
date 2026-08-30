/* ==================================================
   ROTINA
================================================== */

const rotina = [

  {
    inicio: "05:45",
    fim: "07:20",
    nome: "Acordar"
  },

  {
    inicio: "07:20",
    fim: "12:10",
    nome: "Escola"
  },

  {
    inicio: "12:10",
    fim: "13:30",
    nome: "Almoço + descanso"
  },

  {
    inicio: "13:30",
    fim: "14:30",
    nome: "Estudos"
  },

  {
    inicio: "14:30",
    fim: "15:30",
    nome: "Projeto + lanche"
  },

  {
    inicio: "15:30",
    fim: "16:00",
    nome: "Se arrumar"
  },

  {
    inicio: "16:00",
    fim: "18:00",
    nome: "Academia + cardio"
  },

  {
    inicio: "18:00",
    fim: "19:30",
    nome: "Banho + comida + descanso"
  },

  {
    inicio: "19:30",
    fim: "21:30",
    nome: "Projeto / lazer"
  },

  {
    inicio: "21:30",
    fim: "22:30",
    nome: "Relaxar"
  },

  {
    inicio: "22:30",
    fim: "24:00",
    nome: "Dormir"
  }

];


/* ==================================================
   ELEMENTOS
================================================== */

const routineElement =
  document.getElementById("routine");

const progressBar =
  document.getElementById("progressBar");

const progressText =
  document.getElementById("progressText");

const taskCount =
  document.getElementById("taskCount");

const clock =
  document.getElementById("clock");

const date =
  document.getElementById("date");


/* ==================================================
   DATA
================================================== */

function obterDataAtual() {

  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(
    agora.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    agora.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


/* ==================================================
   STORAGE
================================================== */

const dataAtual = obterDataAtual();

const dataSalva =
  localStorage.getItem("rotina-data");

let tarefasConcluidas =
  JSON.parse(
    localStorage.getItem("rotina-tarefas") || "[]"
  );


/* ==================================================
   RESET DIÁRIO
================================================== */

if (dataSalva !== dataAtual) {

  tarefasConcluidas = [];

  localStorage.setItem(
    "rotina-tarefas",
    JSON.stringify([])
  );

  localStorage.setItem(
    "rotina-data",
    dataAtual
  );

}


/* ==================================================
   FIM DE SEMANA
================================================== */

function ehFimDeSemana() {

  const dia =
    new Date().getDay();

  return dia === 0 || dia === 6;

}


/* ==================================================
   CONVERTER HORÁRIO
================================================== */

function converterMinutos(horario) {

  const [hora, minuto] =
    horario.split(":").map(Number);

  return hora * 60 + minuto;

}


/* ==================================================
   ATIVIDADE ATUAL
================================================== */

function atividadeAtual() {

  if (ehFimDeSemana()) {
    return -1;
  }

  const agora =
    new Date();

  const minutos =
    agora.getHours() * 60 +
    agora.getMinutes();

  for (
    let i = 0;
    i < rotina.length;
    i++
  ) {

    const inicio =
      converterMinutos(
        rotina[i].inicio
      );

    const fim =
      converterMinutos(
        rotina[i].fim
      );

    if (
      minutos >= inicio &&
      minutos < fim
    ) {

      return i;

    }

  }

  return -1;

}


/* ==================================================
   RENDERIZAR ROTINA
================================================== */

function renderizarRotina() {

  routineElement.innerHTML = "";


  /* ---------- FIM DE SEMANA ---------- */

  if (ehFimDeSemana()) {

    routineElement.innerHTML = `
      <div class="weekend">
        <strong>Fim de semana</strong>
        <span>Sem atividades programadas.</span>
      </div>
    `;

    return;

  }


  /* ---------- ROTINA NORMAL ---------- */

  const atual =
    atividadeAtual();

  rotina.forEach(
    (atividade, index) => {

      const concluida =
        tarefasConcluidas.includes(index);

      const item =
        document.createElement("div");

      item.className =
        "routine-item";


      if (concluida) {

        item.classList.add(
          "completed"
        );

      }


      if (index === atual) {

        item.classList.add(
          "current"
        );

      }


      item.innerHTML = `

        <div class="routine-time">
          ${atividade.inicio} – ${atividade.fim}
        </div>

        <div class="routine-name">
          ${atividade.nome}
        </div>

        <div class="check">
          ${concluida ? "✓" : ""}
        </div>

      `;


      item.addEventListener(
        "click",
        () => {

          alternarTarefa(index);

        }
      );


      routineElement.appendChild(
        item
      );

    }
  );

}


/* ==================================================
   CHECKLIST
================================================== */

function alternarTarefa(index) {

  /* Nunca permite checklist no fim de semana */

  if (ehFimDeSemana()) {
    return;
  }


  if (
    tarefasConcluidas.includes(index)
  ) {

    tarefasConcluidas =
      tarefasConcluidas.filter(
        item => item !== index
      );

  } else {

    tarefasConcluidas.push(index);

  }


  localStorage.setItem(
    "rotina-tarefas",
    JSON.stringify(
      tarefasConcluidas
    )
  );


  renderizarRotina();

  atualizarProgresso();

}


/* ==================================================
   PROGRESSO
================================================== */

function atualizarProgresso() {

  /* ---------- FIM DE SEMANA ---------- */

  if (ehFimDeSemana()) {

    progressBar.style.width =
      "0%";

    progressText.textContent =
      "—";

    taskCount.textContent =
      "Sem rotina";

    return;

  }


  /* ---------- SEMANA ---------- */

  const total =
    rotina.length;

  const concluidas =
    tarefasConcluidas.length;

  const porcentagem =
    Math.round(
      (concluidas / total) * 100
    );


  progressBar.style.width =
    `${porcentagem}%`;

  progressText.textContent =
    `${porcentagem}%`;

  taskCount.textContent =
    `${concluidas}/${total} concluídas`;

}


/* ==================================================
   RELÓGIO
================================================== */

function atualizarRelogio() {

  const agora =
    new Date();

  const horas =
    String(
      agora.getHours()
    ).padStart(2, "0");

  const minutos =
    String(
      agora.getMinutes()
    ).padStart(2, "0");


  clock.textContent =
    `${horas}:${minutos}`;

}


/* ==================================================
   DATA
================================================== */

function atualizarData() {

  const agora =
    new Date();

  date.textContent =
    agora.toLocaleDateString(
      "pt-BR",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    );

}


/* ==================================================
   ATUALIZAÇÃO
================================================== */

function atualizar() {

  atualizarRelogio();

  atualizarData();

  renderizarRotina();

  atualizarProgresso();

}


/* ==================================================
   INICIALIZAÇÃO
================================================== */

atualizar();


setInterval(
  atualizar,
  1000
);