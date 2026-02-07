const form = document.getElementById('heatPumpForm');
const resultSection = document.getElementById('result');
const resultContent = document.getElementById('resultContent');

const insulationLossFactor = {
  slaba: 1.25,
  srednja: 1,
  dobra: 0.8,
  pasivna: 0.55
};

const climateDesignDelta = {
  blaga: 32,
  umerena: 36,
  hladna: 42
};

const pumpCop = {
  vazduh_voda: 3.2,
  zemlja_voda: 4.1,
  voda_voda: 4.5
};

const systemTempPenalty = {
  podno: 1,
  radijatori_nisko: 0.93,
  radijatori_visoko: 0.82,
  fan_coil: 0.95
};

const systemName = {
  podno: 'Podno grejanje',
  radijatori_nisko: 'Niskotemperaturni radijatori',
  radijatori_visoko: 'Klasični radijatori',
  fan_coil: 'Fan-coil jedinice'
};

const pumpName = {
  vazduh_voda: 'Vazduh-voda',
  zemlja_voda: 'Zemlja-voda',
  voda_voda: 'Voda-voda'
};

function readFormData() {
  const data = new FormData(form);
  return {
    area: Number(data.get('area') || document.getElementById('area').value),
    year: Number(document.getElementById('year').value),
    ceilingHeight: Number(document.getElementById('ceilingHeight').value),
    climateZone: document.getElementById('climateZone').value,
    insulation: document.getElementById('insulation').value,
    occupants: Number(document.getElementById('occupants').value),
    indoorTemp: Number(document.getElementById('indoorTemp').value),
    heatingSystem: document.getElementById('heatingSystem').value,
    pumpType: document.getElementById('pumpType').value,
    dhw: document.getElementById('dhw').value,
    priceKwh: Number(document.getElementById('priceKwh').value)
  };
}

function calculate(config) {
  const volume = config.area * config.ceilingHeight;
  const baseSpecificLoss = config.year >= 2015 ? 0.68 : config.year >= 2000 ? 0.85 : 1.02;
  const designDelta = climateDesignDelta[config.climateZone] + (config.indoorTemp - 20);

  const designLoadKw =
    (volume * baseSpecificLoss * insulationLossFactor[config.insulation] * designDelta) / 1000;

  const dhwLoadKw = config.dhw === 'da' ? 0.35 * config.occupants : 0;
  const nominalPowerKw = (designLoadKw + dhwLoadKw) * 1.15;

  const correctedCop = pumpCop[config.pumpType] * systemTempPenalty[config.heatingSystem];

  const annualHeatDemandKwh =
    config.area * (config.climateZone === 'hladna' ? 165 : config.climateZone === 'umerena' ? 130 : 105) *
    insulationLossFactor[config.insulation] +
    (config.dhw === 'da' ? config.occupants * 750 : 0);

  const annualElectricityKwh = annualHeatDemandKwh / correctedCop;
  const annualCost = annualElectricityKwh * config.priceKwh;

  const bufferTankLiters = Math.round(nominalPowerKw * 18);
  const recommendedSupplyTemp =
    config.heatingSystem === 'podno' ? '30–35°C' : config.heatingSystem === 'radijatori_nisko' ? '40–45°C' : '50–55°C';

  return {
    designLoadKw,
    nominalPowerKw,
    correctedCop,
    annualHeatDemandKwh,
    annualElectricityKwh,
    annualCost,
    bufferTankLiters,
    recommendedSupplyTemp
  };
}

function renderResult(config, values) {
  resultSection.hidden = false;

  const efficiencyBadge =
    values.correctedCop > 4 ? '<span class="badge">Vrlo efikasno</span>' : values.correctedCop > 3 ? '<span class="badge">Efikasno</span>' : '';

  resultContent.innerHTML = `
    <p>
      Preporučena <strong>toplotna pumpa ${pumpName[config.pumpType]}</strong> za objekat od
      <strong>${config.area} m²</strong> sa sistemom <strong>${systemName[config.heatingSystem]}</strong>.
      ${efficiencyBadge}
    </p>
    <ul>
      <li>Projektni toplotni gubici: <strong>${values.designLoadKw.toFixed(1)} kW</strong></li>
      <li>Predlog nominalne snage pumpe: <strong>${values.nominalPowerKw.toFixed(1)} kW</strong></li>
      <li>Procenjeni sezonski COP (SCOP): <strong>${values.correctedCop.toFixed(2)}</strong></li>
      <li>Godišnja potreba toplote: <strong>${Math.round(values.annualHeatDemandKwh)} kWh</strong></li>
      <li>Procenjena godišnja potrošnja struje: <strong>${Math.round(values.annualElectricityKwh)} kWh</strong></li>
      <li>Okvirni godišnji trošak: <strong>${values.annualCost.toFixed(0)} €</strong></li>
      <li>Preporučena temperatura polaza: <strong>${values.recommendedSupplyTemp}</strong></li>
      <li>Preporučena zapremina bafera: <strong>${values.bufferTankLiters} l</strong></li>
    </ul>
    <p class="note">
      Napomena: Ovo je informativni proračun za privatna domaćinstva. Za konačno dimenzionisanje
      potrebni su detaljni termotehnički proračuni i obilazak objekta.
    </p>
  `;
}

function saveConfiguration() {
  const config = readFormData();
  localStorage.setItem('heatPumpConfig', JSON.stringify(config));
  alert('Konfiguracija je sačuvana lokalno u pregledaču.');
}

function loadConfiguration() {
  const raw = localStorage.getItem('heatPumpConfig');
  if (!raw) return;

  const config = JSON.parse(raw);
  Object.entries(config).forEach(([key, value]) => {
    const field = document.getElementById(key);
    if (field) {
      field.value = value;
    }
  });
}

function exportConfiguration() {
  const config = readFormData();
  const calc = calculate(config);
  const output = {
    createdAt: new Date().toISOString(),
    config,
    calculation: {
      ...calc,
      designLoadKw: Number(calc.designLoadKw.toFixed(2)),
      nominalPowerKw: Number(calc.nominalPowerKw.toFixed(2)),
      correctedCop: Number(calc.correctedCop.toFixed(2)),
      annualHeatDemandKwh: Math.round(calc.annualHeatDemandKwh),
      annualElectricityKwh: Math.round(calc.annualElectricityKwh),
      annualCost: Number(calc.annualCost.toFixed(0))
    }
  };

  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'konfiguracija-toplotne-pumpe.json';
  a.click();
  URL.revokeObjectURL(url);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const config = readFormData();
  const values = calculate(config);
  renderResult(config, values);
});

document.getElementById('saveBtn').addEventListener('click', saveConfiguration);
document.getElementById('exportBtn').addEventListener('click', exportConfiguration);

loadConfiguration();
