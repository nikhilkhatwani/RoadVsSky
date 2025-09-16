/**********************
 * Helpers
 **********************/
const removeChildNodes = (select) => {
  var i,
    L = select.options.length - 1;
  for (i = L; i >= 0; i--) {
    // if (!select[i].disabled) {
    select.remove(i);
    // }
  }

  let disabledOption = document.createElement("option");
  disabledOption.disabled = true;
  disabledOption.selected = true;

  const key = `select${select.name}`;
  const language = getCurrLanguage();

  disabledOption.textContent =
    language !== null
      ? translations[language][key]
      : `Select a ${select.name.toLowerCase()}`;

  select.disabled = true;
  select.append(disabledOption);
};

const resetSelect = (selects) => {
  for (const [index, select] of selects.entries()) {
    console.log(index);
    let i,
      L = select.options.length - 1;

    for (i = L; i >= 0; i--) {
      select[i].selected = select[i].disabled ? true : false;
    }

    select.disabled = index !== 0;
  }
};

const dateFocus = (e) => {
  e.type = "date";
  e.min = new Date().toISOString().split("T")[0];
};

const getCurrLanguage = () => {
  return localStorage.getItem("roadVsSky-lang");
};

const formatDuration = (mins) => {
  const hours = Math.floor(mins / 60);
  const remainingMinutes = mins % 60;

  return `${hours}hr ${remainingMinutes}m`;
};

const createPlaneItinerary = (
  airlineLogo,
  departureTime,
  departureLoc,
  arrivalTime,
  arrivalLoc,
  duration,
  price,
  parent = document.querySelector(".plane-list")
) => {
  const itineraryDiv = document.createElement("div");
  itineraryDiv.classList.add("plane-itinerary");

  const planeLeftDiv = document.createElement("div");
  planeLeftDiv.classList.add("plane-left");

  const planeMainDiv = document.createElement("div");
  planeMainDiv.classList.add("plane-main");

  const img = document.createElement("img");
  img.src = airlineLogo;

  const leftDiv = document.createElement("div");
  leftDiv.classList.add("left");
  const leftTime = document.createElement("p");
  leftTime.classList.add("time");
  leftTime.textContent = departureTime;
  const leftLoc = document.createElement("p");
  leftLoc.classList.add("loc");
  leftLoc.textContent = departureLoc;

  const dividerDiv = document.createElement("div");
  dividerDiv.classList.add("divider");
  const hrTime = document.createElement("div");
  hrTime.classList.add("hrTime");
  hrTime.textContent = duration;

  const rightDiv = document.createElement("div");
  rightDiv.classList.add("right");
  const rightTime = document.createElement("p");
  rightTime.classList.add("time");
  rightTime.textContent = arrivalTime;
  const rightLoc = document.createElement("p");
  rightLoc.classList.add("loc");
  rightLoc.textContent = arrivalLoc;

  const planeRightDiv = document.createElement("div");
  planeRightDiv.classList.add("plane-right");
  const priceP = document.createElement("p");
  priceP.classList.add("price");
  priceP.textContent = price;
  const selectBtnDiv = document.createElement("div");
  selectBtnDiv.classList.add("selectbtn");
  selectBtnDiv.textContent = translations[getCurrLanguage()].selectBtn;

  leftDiv.appendChild(leftTime);
  leftDiv.appendChild(leftLoc);
  dividerDiv.appendChild(hrTime);
  rightDiv.appendChild(rightTime);
  rightDiv.appendChild(rightLoc);
  planeMainDiv.appendChild(img);
  planeMainDiv.appendChild(leftDiv);
  planeMainDiv.appendChild(dividerDiv);
  planeMainDiv.appendChild(rightDiv);

  planeRightDiv.appendChild(priceP);
  planeRightDiv.appendChild(selectBtnDiv);

  itineraryDiv.appendChild(planeLeftDiv);
  itineraryDiv.appendChild(planeMainDiv);
  itineraryDiv.appendChild(planeRightDiv);

  parent.appendChild(itineraryDiv);

  selectBtnDiv.addEventListener("click", (e) => {
    const allSelects = document.querySelectorAll(".selectbtn");
    for (const s of allSelects) {
      s.classList.remove("selected");
      s.textContent = translations[getCurrLanguage()].selectBtn;
    }

    selectBtnDiv.classList.add("selected");
    selectBtnDiv.textContent = translations[getCurrLanguage()].selected;
  });
};

/**********************
 * Fetchers
 **********************/
const fetchYears = async () => {
  let response = await fetchJsonp(
    "https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getYears"
  );

  let data = await response.json();
  return data;
};

const fetchMakes = async (year) => {
  let response = await fetchJsonp(
    `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes&year=${year}&sold_in_us=1`
  );

  let data = await response.json();
  return data;
};

const fetchModels = async (year, make) => {
  let response = await fetchJsonp(
    `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getModels&make=${make}&year=${year}&sold_in_us=1`
  );

  let data = await response.json();
  return data;
};

const fetchTrims = async (year, make, model) => {
  let response = await fetchJsonp(
    `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&year=${year}&make=${make}&model=${model}`
  );

  let data = await response.json();
  return data;
};

const fetchData = async (model_id) => {
  let response = await fetchJsonp(
    `https://www.carqueryapi.com/api/0.3/?cmd=getModel&model=${model_id}`
  );

  let data = await response.json();
  return data;
};

const body = document.getElementsByTagName("body")[0];
const selectors = document.getElementsByClassName("selectors")[0];
const carTypeSelectors = document.querySelector(".car-type-selector");

const yearSelect = document.getElementById("yearSelect");
const makeSelect = document.getElementById("makeSelect");
const modelSelect = document.getElementById("modelSelect");
const trimSelect = document.getElementById("trimSelect");

const generate = document.querySelector(".generate");
const loader = document.querySelector(".loader");
const planeList = document.querySelector(".plane-list");
const fillOthers = document.querySelectorAll(".fill-others");

fetchYears().then((res) => {
  const { min_year, max_year } = res.Years;

  for (let i = max_year; i >= min_year; i--) {
    const newOption = document.createElement("option");
    newOption.value = i;
    newOption.textContent = i;
    yearSelect.append(newOption);
  }
});

yearSelect.onchange = (e) => {
  let year = e.target.value;
  //   resetAndDisableSelects([makeSelect, modelSelect, trimSelect]);
  generateMakes(year);
};

/**********************
 * Generators
 **********************/
const generateMakes = (year) => {
  removeChildNodes(makeSelect);
  removeChildNodes(modelSelect);
  removeChildNodes(trimSelect);

  makeSelect.disabled = false;

  fetchMakes(year).then((res) => {
    for (let i = 0; i < res.Makes.length; i++) {
      const newOption = document.createElement("option");
      newOption.value = res.Makes[i].make_id;
      newOption.textContent = res.Makes[i].make_display;
      makeSelect.append(newOption);
    }

    makeSelect.onchange = (e) => {
      const make = e.target.value;
      generateModels(year, make);
    };
  });
};

const generateModels = (year, make) => {
  removeChildNodes(modelSelect);
  removeChildNodes(trimSelect);

  modelSelect.disabled = false;

  fetchModels(year, make).then((res) => {
    for (let i = 0; i < res.Models.length; i++) {
      const newOption = document.createElement("option");
      newOption.value = res.Models[i].model_name;
      newOption.textContent = res.Models[i].model_name;
      modelSelect.append(newOption);
    }

    modelSelect.onchange = (e) => {
      const model = e.target.value;
      generateTrims(year, make, model);
    };
  });
};

const generateTrims = (year, make, model) => {
  removeChildNodes(trimSelect);
  trimSelect.disabled = false;

  fetchTrims(year, make, model).then((res) => {
    for (let i = 0; i < res.Trims.length; i++) {
      const newOption = document.createElement("option");
      newOption.value = res.Trims[i].model_id;
      newOption.textContent = res.Trims[i].model_trim;
      trimSelect.append(newOption);
    }

    trimSelect.onchange = (e) => {
      const model_id = e.target.value;
      generateData(model_id);
    };
  });
};

const generateData = (model_id) => {
  fetchData(model_id).then((res) => {
    const {
      model_year,
      model_make_display: model_make,
      model_name,
      model_trim,
      model_lkm_hwy: model_mpg_hwy,
      model_fuel_cap_l: model_fuel_cap_g,
    } = res[0];
    getImage(`${model_year} ${model_make} ${model_name}`, {
      year: model_year,
      make: model_make,
      model: model_name,
      trim: model_trim,
      mpg_hwy:
        Math.round(model_mpg_hwy) == 0 || model_mpg_hwy == null
          ? 30
          : Math.round(model_mpg_hwy),
      fuel_cap:
        model_fuel_cap_g == null || model_fuel_cap_g == 0
          ? 13
          : model_fuel_cap_g,
    });
  });
};

const getImage = (query, car) => {
  const { year, make, model, trim, mpg_hwy, fuel_cap } = car;

  const apiKey = "-";
  const cx = "067cfc67f0ec78d1f";
  const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&searchType=image&key=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      //   console.log(data.items[0].link);
      let imageSrc = data.error ? null : data.items[0].link;

      const language = getCurrLanguage();

      const car = document.querySelector(".car");
      const carDetails = document.querySelector(".car-details");
      const imagePlace = document.querySelector(".car-image");

      carDetails.style.display = "none";
      imagePlace.style.display = "none";
      selectors.style.display = "none";
      carTypeSelectors.style.display = "none";

      const carSelectedDiv = document.createElement("div");
      carSelectedDiv.className = "car-selected";

      let image;

      if (imageSrc) {
        image = document.createElement("img");
        image.src = imageSrc;
      } else {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("stroke-width", "0");
        svg.setAttribute("viewBox", "0 0 512 512");
        svg.setAttribute("height", "162px");
        svg.setAttribute("width", "90px");
        svg.setAttribute("color", "rgb(116, 116, 96)");

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute(
          "d",
          "M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z"
        );

        svg.appendChild(path);
        image = svg;
      }

      image.className = "carImg";
      carSelectedDiv.append(image);

      const carTextDiv = document.createElement("div");
      carTextDiv.className = "car-text";
      carSelectedDiv.append(carTextDiv);

      const carTextUpperDiv = document.createElement("div");
      carTextUpperDiv.className = "car-text-upper";
      carTextDiv.append(carTextUpperDiv);

      const carTextLowerDiv = document.createElement("div");
      carTextLowerDiv.className = "car-text-lower";
      carTextDiv.append(carTextLowerDiv);

      const carTitle = document.createElement("h2");
      carTitle.className = "car-title";
      carTitle.textContent = `${year} ${make} ${model}`;
      carTextUpperDiv.append(carTitle);

      const carDesc = document.createElement("p");
      carDesc.classList = "car-description";
      carDesc.textContent = `${trim}`;
      carTextUpperDiv.append(carDesc);

      const carMPG = document.createElement("p");
      carMPG.classList = "car-mpg";
      carMPG.textContent = `${translations[language].mpg}: ${mpg_hwy}`;
      carTextLowerDiv.append(carMPG);

      const carFuelCap = document.createElement("p");
      carFuelCap.classList = "car-fuelcap";
      carFuelCap.textContent = `${translations[language].fuelCap}: ${fuel_cap}`;
      carTextLowerDiv.append(carFuelCap);

      const selectAnotherDiv = document.createElement("div");
      selectAnotherDiv.classList = "select-another";
      selectAnotherDiv.innerHTML =
        '<span>Select another car<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 36.1 25.8" enable-background="new 0 0 36.1 25.8" xml:space="preserve"><g><line fill="none" stroke="rgb(116, 116, 96)" stroke-width="3" stroke-miterlimit="10" x1="0" y1="12.9" x2="34" y2="12.9"></line><polyline fill="none" stroke="rgb(116, 116, 96)" stroke-width="3" stroke-miterlimit="10" points="22.2,1.1 34,12.9 22.2,24.7"></polyline></g></svg></span>';

      car.append(selectAnotherDiv);
      car.append(carSelectedDiv);

      selectAnotherDiv.addEventListener("click", (e) => {
        carSelectedDiv.remove();
        selectAnotherDiv.remove();

        carDetails.style.display = "flex";
        imagePlace.style.display = "flex";
        selectors.style.display = "flex";
        carTypeSelectors.style.display = "flex";

        resetSelect([makeSelect, modelSelect, trimSelect]);
      });
    });
};

/**********************
 * Trip Calculation
 **********************/
const globalDistances = {
  MFE: {
    AUS: 313,
    DFW: 507.2,
    IAH: 347.5,
  },
  BRO: {
    AUS: 350.8,
    DFW: 545,
    IAH: 353.5,
  },
};

const GAS_PER_GALLON = 2.8;

const calculateTrip = (
  gasPrice,
  mpg,
  fuelCapacity,
  startingGallons,
  totalDistance,
  averageSpeed
) => {
  let remainingFuel = startingGallons;
  let remainingMiles = totalDistance;
  let numberOfStops = 0;
  let costOfGas = gasPrice * startingGallons;
  let stopDistances = [];
  let totalTimeInMinutes = 0;

  while (remainingMiles > 0) {
    let maxDriveableMiles = remainingFuel * mpg;

    if (remainingMiles <= maxDriveableMiles) {
      totalTimeInMinutes += (remainingMiles / averageSpeed) * 60;
      remainingMiles = 0;
      remainingFuel -= remainingMiles / mpg;
    } else {
      remainingMiles -= maxDriveableMiles;
      stopDistances.push(totalDistance - remainingMiles);

      remainingFuel = fuelCapacity * 0.25;
      costOfGas += gasPrice * (fuelCapacity - remainingFuel);

      numberOfStops++;

      totalTimeInMinutes += (maxDriveableMiles / averageSpeed) * 60;
    }
  }

  return {
    numberOfStops: numberOfStops,
    costOfGas: costOfGas.toFixed(2),
    stopDistances: stopDistances,
    remainingFuel: remainingFuel.toFixed(2),
    remainingMiles: remainingMiles,
    totalTimeInMinutes: totalTimeInMinutes.toFixed(2),
  };
};

/***************************
 * Auto-Fill vs Manual-Fill
 ***************************/
const carSelectors = document.querySelectorAll(".car-type");

carSelectors.forEach((s) => {
  const allSelectors = [yearSelect, makeSelect, modelSelect, trimSelect];
  const allInputs = [
    document.querySelector("#mpgInput"),
    document.querySelector("#ftcInput"),
  ];

  s.addEventListener("click", (e) => {
    carSelectors.forEach((carS) => {
      carS.classList.remove("active");
    });

    s.classList.add("active");

    for (const select of allSelectors) {
      select.style.display = s.classList.contains("automatic")
        ? "flex"
        : "none";
    }

    for (const i of allInputs) {
      i.style.display = s.classList.contains("automatic") ? "none" : "flex";
    }
  });
});

/**********************
 * Scrolling Animations
 **********************/
window.addEventListener("scroll", () => {
  document.querySelector(".hero-content .plane").style.transform = `translate(${
    document.documentElement.scrollTop * 0.8
  }px, -${document.documentElement.scrollTop * 0.4}px)`;

  document.querySelector(".car-logo").style.transform = `translate(${
    -document.documentElement.scrollTop * 0.5
  }px, ${document.documentElement.scrollTop * 0.3}px)`;
});

/**********************
 * Translations
 **********************/
const translations = {
  en: {
    title: "Road vs Sky",
    heroTitle: "Plan Your Journey, Your way",
    heroDesc:
      "Discover how much your next road trip or flight will really cost—personalized for you.",
    heroCTA: "Start Comparison",
    comingFrom: "Coming from",
    headedTo: "Headed to",
    dateLeaving: "Departure date",
    numberOfPeople: "Number of people",
    carDetails: "Car details",
    planeDetails: "Plane Details",
    selectYear: "Select a year",
    selectMake: "Select a make",
    selectModel: "Select a model",
    selectTrim: "Select a trim",
    mpg: "Miles per gallon (hwy)",
    fuelCap: "Fuel capacity (g)",
    fillAboveFirst: "Fill out the above fields first.",
    generateResults: "Generate Results",
    selectBtn: "Select",
    selected: "Selected",
    regenerate: "Regenerate",
  },
  es: {
    title: "Carretera contra cielo",
    heroTitle: "Planifica tu viaje, a tu manera",
    heroDesc:
      "Descubra cuánto costará realmente su próximo viaje por carretera o vuelo, personalizado para usted.",
    heroCTA: "Iniciar comparación",
    comingFrom: "Viniendo de",
    headedTo: "Dirigido a",
    dateLeaving: "Fecha de salida",
    numberOfPeople: "Número de personas",
    carDetails: "Detalles del auto",
    planeDetails: "Detalles del avión",
    selectYear: "Seleccione un año",
    selectMake: "Seleccione una marca",
    selectModel: "Seleccione un modelo",
    selectTrim: "Seleccione un ajuste",
    mpg: "Millas por galón (carretera)",
    fuelCap: "Capacidad de combustible (g)",
    fillAboveFirst: "Primero complete los campos anteriores.",
    generateResults: "Generar Resultados",
    selectBtn: "Seleccionar",
    selected: "Seleccionado",
    regenerate: "Regenerado",
  },
};

const translatePage = (language) => {
  document.querySelector("title").textContent = translations[language].title;
  document.querySelector(".middle h1").textContent =
    translations[language].title;
  document.querySelector(".left h1").textContent = translations[language].title;
  document.querySelector(".hero-content h2").textContent =
    translations[language].heroTitle;
  document.querySelector(".hero-content p").textContent =
    translations[language].heroDesc;
  document.querySelector(".startBtn").textContent =
    translations[language].heroCTA;
  document.getElementById("comingFrom").options[0].text =
    translations[language].comingFrom;
  document.getElementById("headedTo").options[0].text =
    translations[language].headedTo;
  document.querySelector("#date").placeholder =
    translations[language].dateLeaving;
  document.querySelector("input[type='number']").placeholder =
    translations[language].numberOfPeople;
  document.querySelector(".car .number").textContent =
    translations[language].carDetails;
  document.querySelector(".plane-content .number").textContent =
    translations[language].planeDetails;
  document
    .querySelector("#yearSelect")
    .querySelector("option:disabled").textContent =
    translations[language].selectYear;
  document
    .querySelector("#makeSelect")
    .querySelector("option:disabled").textContent =
    translations[language].selectMake;
  document
    .querySelector("#modelSelect")
    .querySelector("option:disabled").textContent =
    translations[language].selectModel;
  document
    .querySelector("#trimSelect")
    .querySelector("option:disabled").textContent =
    translations[language].selectTrim;
  document.querySelector("#mpgInput").placeholder = translations[language].mpg;
  document.querySelector("#ftcInput").placeholder =
    translations[language].fuelCap;
  generate.lastChild.textContent = generate.classList.contains("re-gen")
    ? translations[language].regenerate
    : translations[language].generateResults;

  let carMpg = document.querySelector(".car-mpg");
  if (carMpg)
    carMpg.textContent = `${translations[language].mpg}: ${carMpg.textContent
      .split(":")[1]
      .trim()}`;

  let carFuelCap = document.querySelector(".car-fuelcap");
  if (carFuelCap)
    carFuelCap.textContent = `${
      translations[language].fuelCap
    }: ${carFuelCap.textContent.split(":")[1].trim()}`;

  for (const fO of fillOthers) {
    fO.textContent = translations[language].fillAboveFirst;
  }

  let allSelectBtn = document.querySelectorAll(".selectbtn");
  if (allSelectBtn.length > 0) {
    for (const btn of allSelectBtn) {
      btn.textContent = btn.classList.contains("selected")
        ? translations[language].selected
        : translations[language].selectBtn;
    }
  }
};

document.querySelectorAll(".lang").forEach((tr) => {
  tr.addEventListener("click", (e) => {
    const lang = event.target.alt == "Spanish" ? "es" : "en";
    translatePage(lang);

    localStorage.setItem("roadVsSky-lang", lang);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const langItem = getCurrLanguage();
  if (langItem) translatePage(langItem);

  const comingFrom = document.getElementById("comingFrom");
  const headedTo = document.getElementById("headedTo");
  const date = document.getElementById("date");
  const numberOfPeople = document.querySelector('input[type="number"]');
  const carDetails = document.querySelector(".car-details");

  let generateEventListenerAdded = false;

  const checkAllFields = () => {
    const isComingFromSelected = comingFrom.value !== "";
    const isHeadedToSelected = headedTo.value !== "";
    const isDateFilled = date.value.trim() !== "";
    const isNumberOfPeopleFilled = numberOfPeople.value.trim() !== "";

    const carSelected = document.querySelector(".car-selected");

    if (
      isComingFromSelected &&
      isHeadedToSelected &&
      isDateFilled &&
      isNumberOfPeopleFilled
    ) {
      if (!carSelected || carSelected.style.display == "none") {
        carTypeSelectors.style.display = "flex";
        selectors.style.display = "flex";
        carDetails.style.display = "flex";
      }

      for (const fO of fillOthers) {
        fO.style.display = "none";
      }

      generate.style.display = "flex";

      if (planeList.firstChild) {
        generate.lastChild.textContent =
          translations[getCurrLanguage()].regenerate;
        generate.classList.add("re-gen");
      }

      if (!generateEventListenerAdded) {
        generate.addEventListener("click", (e) => {
          fetchFlightData(
            comingFrom.value,
            headedTo.value,
            date.value.trim(),
            numberOfPeople.value.trim()
          );
        });
        generateEventListenerAdded = true;
      }
    }
  };

  comingFrom.addEventListener("change", checkAllFields);
  headedTo.addEventListener("change", checkAllFields);
  date.addEventListener("input", checkAllFields);
  numberOfPeople.addEventListener("input", checkAllFields);

  document.querySelector(".startBtn").addEventListener("click", (e) => {
    const carElement = document.querySelector(".car");
    if (carElement) {
      carElement.scrollIntoView({ behavior: "smooth" });
    } else {
      // console.error(".car element not found.");
    }
  });

  document.querySelector(".compare").addEventListener("click", (e) => {
    const carSelected = document.querySelector(".car-selected");
    const selected = document.querySelector(".selectbtn.selected");
    const mpgInput = document.querySelector("#mpgInput");
    const ftcInput = document.querySelector("#ftcInput");

    let mpgVal = mpgInput.value.trim();
    let ftcVal = ftcInput.value.trim();

    if (!carSelected && (mpgVal == "" || ftcVal == "")) {
      alert("Select a car or manually input the values.");
    } else if (!selected) {
      alert("Select a plane first.");
    } else {
      if (carSelected && carSelected.style.display !== "none") {
        const carMpg = document.querySelector(".car-mpg");
        const ftcCap = document.querySelector(".car-fuelcap");

        mpgVal = parseInt(carMpg.textContent.split(":")[1].trim());
        ftcVal = parseInt(ftcCap.textContent.split(":")[1].trim());
      }

      const planeI = selected.parentElement.parentElement;

      let price = selected.parentElement.querySelector(".price").textContent;
      let hrTime = planeI
        .querySelector(".plane-main")
        .querySelector(".divider")
        .querySelector(".hrTime").textContent;

      const roadTrip = calculateTrip(
        GAS_PER_GALLON,
        parseFloat(mpgVal),
        parseFloat(ftcVal),
        parseFloat(ftcVal),
        globalDistances[comingFrom.value][headedTo.value],
        60
      );

      const { costOfGas, numberOfStops, totalTimeInMinutes } = roadTrip;

      const compared = document.querySelector(".compared");

      const carVals = document.querySelector("#car-vals");
      const planeVals = document.querySelector("#plane-vals");

      const carPrice = carVals.querySelector("#price");
      const carDur = carVals.querySelector("#duration");
      const carStops = carVals.querySelector("#numStops");

      const planePrice = planeVals.querySelector("#price");
      const planeDur = planeVals.querySelector("#duration");
      const planeStops = planeVals.querySelector("#numStops");

      carPrice.textContent = `$${Math.round(costOfGas)}`;
      carDur.textContent = formatDuration(totalTimeInMinutes);
      carStops.textContent = numberOfStops;

      planePrice.textContent = price;
      planeDur.textContent = hrTime;
      planeStops.textContent = 0;

      compared.style.display = "flex";
    }
  });
});

const fetchFlightData = async (comingFrom, headedTo, date, passengerCount) => {
  const ids = {
    MFE: 95673745,
    BRO: 95673747,
    AUS: 95673643,
    IAH: 95673412,
    DFW: 95673499,
  };

  if (planeList) {
    while (planeList.firstChild) planeList.firstChild.remove();
  }

  let originId = ids[comingFrom];
  let destId = ids[headedTo];

  generate.style.display = "none";
  planeList.style.display = "none";
  loader.style.display = "flex";

  const url = `https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlights?originSkyId=${comingFrom}&destinationSkyId=${headedTo}&originEntityId=${originId}&destinationEntityId=${destId}&date=${date}&cabinClass=economy&adults=${passengerCount}&sortBy=best&limit=15&currency=USD&market=en-US&countryCode=US`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "c300e6c07fmshe2e9e3daf86b1fep1cc967jsn374c1f515b30",
      "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (result && result.data && result.data.itineraries) {
      let itineraries = result.data.itineraries;
      for (const itinerary of itineraries) {
        let {
          price: { formatted },
          legs,
        } = itinerary;
        let {
          departure,
          arrival,
          durationInMinutes,
          carriers: { marketing },
        } = legs[0];
        let { logoUrl } = marketing[0];

        departure = new Date(departure).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        arrival = new Date(arrival).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        durationInMinutes = formatDuration(durationInMinutes);

        createPlaneItinerary(
          logoUrl,
          departure,
          comingFrom,
          arrival,
          headedTo,
          durationInMinutes,
          formatted
        );
      }

      loader.style.display = "none";
      planeList.style.display = "flex";
    }
  } catch (error) {
    console.error(error);
  }
};
