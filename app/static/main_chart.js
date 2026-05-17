const margin = { top: 70, bottom: 50, right: 60, left: 80 };
const width = 1600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const dates = window.dates;
const prices = window.prices;
const rm_200_raw = window.rm_200;
const rm_30_raw = window.rm_30;
const crossings = window.crossings;

console.log('data lengths:', {
  dates: Array.isArray(dates) ? dates.length : typeof dates,
  prices: Array.isArray(prices) ? prices.length : typeof prices,
  rm_200: Array.isArray(rm_200_raw) ? rm_200_raw.length : typeof rm_200_raw,
  rm_30: Array.isArray(rm_30_raw) ? rm_30_raw.length : typeof rm_30_raw,
});



// Create the SVG element and append it to the chart container
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Tooltipy (divy)
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")

const tooltipRawDate = d3.select("body")
  .append("div")
  .attr("class", "tooltip")

// Gradient
const gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

gradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 1);

gradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 0);

// Tworzymy tablicę obiektów { Date, Price }
const data = dates.map((d, i) => ({
    Date: new Date(d),
    Price: prices[i]
}));

// // Tablice dla rm_200 i rm_30
const rm200DataOriginal = dates.map((d, i) => ({
     Date: new Date(d),
     Price: typeof rm_200_raw[i] !== 'undefined' ? rm_200_raw[i] : NaN
 }));
let rm200DataCurrent = rm200DataOriginal.slice();

const rm30DataOriginal = dates.map((d, i) => ({
    Date: new Date(d),
    Price: typeof rm_30_raw[i] !== 'undefined' ? rm_30_raw[i] : NaN
}));
let rm30DataCurrent = rm30DataOriginal.slice();

console.log('RM200 Raw Data (rm_200_raw):', rm_200_raw);
console.log('RM200 Processed Data (rm200Data):', rm200DataCurrent);


// Mapowanie crossingów na obiekty z datę i Y zależnym od rm200
const crossingsArray = Array.isArray(crossings) ? crossings : [];
const crossingDates = crossingsArray.map(d => ({
  date: new Date(d[0]),
  direction: d[1]
}))

const bisectRm200 = d3.bisector(d => d.Date).left;
// Znajdź wartość Y (rm200) dla każdej daty crossing, wybierając najbliższy punkt
const crossingsData = crossingDates.map(cd => {
  if (!rm200DataCurrent || rm200DataCurrent.length === 0) return { ...cd, value: NaN };

  const i = bisectRm200(rm200DataCurrent, cd.date);
  // sprawdź sąsiadów i wybierz bliższy
  const prev = rm200DataCurrent[i - 1];
  const next = rm200DataCurrent[i];
  let chosen = null;
  if (prev && next) {
    chosen = (Math.abs(cd.date - prev.Date) <= Math.abs(next.Date - cd.date)) ? prev : next;
  } else {
    chosen = prev || next || null;
  }
  return { date: cd.date, direction: cd.direction, value: chosen ? chosen.Price : NaN };
}).filter(d => !isNaN(d.value));


// Set the domains for the x and y scales
x.domain(d3.extent(data, d => d.Date));
y.domain([0, d3.max(data, d => d.Price)]);


// Oś X
svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .style("font-size", "14px")
    .call(d3.axisBottom(x)
      .tickValues(x.ticks(d3.timeYear.every(1)))
      .tickFormat(d3.timeFormat("%Y")))
    .selectAll(".tick line")
    .style("stroke-opacity", 1)
    .selectAll(".tick text")
    .attr("fill", "#777");

  // Add the y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width},0)`)
    .style("font-size", "14px")
    .call(d3.axisRight(y)
      .ticks(10)
      .tickFormat(d => {
        if (isNaN(d)) return "";
        return `$${d.toFixed(2)}`;
      }))
    .selectAll(".tick text")
    .style("fill", "#777");

// Set up the line generator
const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.Price));

// Create an area generator
const area = d3.area()
    .x(d => x(d.Date))
    .y0(height)
    .y1(d => y(d.Price));

// Add the area path
svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", "url(#gradient)")
    .style("opacity", .5);

// Add the line path
svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#85bb65")
    .attr("stroke-width", 1.5)
    .attr("d", line);

 // Generator linii dla rm_200
 const lineRm200 = d3.line()
     .defined(d => !isNaN(d.Price) && d.Price !== null)
     .x(d => x(d.Date))
     .y(d => y(d.Price));

// Generator linii dla rm_30
const lineRm30 = d3.line()
    .defined(d => !isNaN(d.Price) && d.Price !== null)
    .x(d => x(d.Date))
    .y(d => y(d.Price));

// Dodaj ścieżkę dla rm_200
 svg.append("path")
     .datum(rm200DataCurrent)
     .attr("class", "line-rm200")
     .attr("fill", "none")
     .attr("stroke", "orange") // Wybierz kolor
     .attr("stroke-width", 2.5)
     .attr("d", lineRm200);

// Dodaj ścieżkę dla rm_30
svg.append("path")
    .datum(rm30DataCurrent)
    .attr("class", "line-rm30")
    .attr("fill", "none")
    .attr("stroke", "blue") // Wybierz kolor
    .attr("stroke-width", 2.5)
    .attr("d", lineRm30);

// Add an interactive circle
const circle = svg.append("circle")
  .attr("r", 0)
  .attr("fill", "red")
  .style("stroke", "white")
  .attr("opacity", 0.7)
  .style("pointer-events", "none");

// Add red lines extending from the circle to the date and value
const tooltipLineX = svg.append("line")
  .attr("class", "tooltip-line")
  .attr("id", "tooltip-line-x")
  .attr("stroke", "red")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

const tooltipLineY = svg.append("line")
  .attr("class", "tooltip-line")
  .attr("id", "tooltip-line-y")
  .attr("stroke", "red")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

// Prostokąt nasłuchujący ruch myszy
const listeningRect = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all");

listeningRect.on("mousemove", function(event) {
  const [xCoord] = d3.pointer(event, this);
  const bisectDate = d3.bisector(d => d.Date).left;
  const x0 = x.invert(xCoord);
  const i = bisectDate(data, x0, 1);
  const d0 = data[i - 1];
  const d1 = data[i];
  const d = (!d1 || (x0 - d0.Date < d1.Date - x0)) ? d0 : d1;
  if (!d) return;

  const xPos = x(d.Date);
  const yPos = y(d.Price);

  // Aktualizacja pozycji kółka
  circle.attr("cx", xPos).attr("cy", yPos)
        .transition().duration(50).attr("r", 5);

  // Linie pomocnicze
  tooltipLineX.style("display", "block")
    .attr("x1", xPos).attr("x2", xPos)
    .attr("y1", 0).attr("y2", height);

  tooltipLineY.style("display", "block")
    .attr("y1", yPos).attr("y2", yPos)
    .attr("x1", 0).attr("x2", width);

  // Tooltipy
  tooltip.style("display", "block")
    .style("left", `${width + margin.left + 30}px`)
    .style("top", `${yPos + margin.top}px`)
    .html(`$${d.Price.toFixed(2)}`);

  tooltipRawDate.style("display", "block")
    .style("left", `${xPos + margin.left}px`)
    .style("top", `${height + margin.top + 10}px`)
    .html(d.Date.toISOString().slice(0, 10));
});

listeningRect.on("mouseleave", () => {
  circle.transition().duration(50).attr("r", 0);
  tooltip.style("display", "none");
  tooltipRawDate.style("display", "none");
  tooltipLineX.style("display", "none");
  tooltipLineY.style("display", "none");
});


function drawCrossingsDots(currentCrossingsData, currentXDomain) {
    const dotRadius = 15;

    // 1. Filtrowanie danych do aktualnie widocznego zakresu
    const visibleCrossings = currentCrossingsData.filter(d =>
        d.date >= currentXDomain[0] && d.date <= currentXDomain[1]
    );

    // 2. Wzór D3: JOIN, EXIT, UPDATE, ENTER
    const dots = svg.selectAll(".crossings-dot")
        .data(visibleCrossings, d => d.date.getTime()); // Klucz jest datą (milisekundy)

    // EXIT: Usuń kropki, które wyszły poza zakres
    dots.exit()
        .transition().duration(200)
        .attr("r", 0) // Efekt znikania
        .remove();

    // UPDATE: Aktualizuj pozycję (gdy zmieni się skalowanie/zakres)
    dots.transition().duration(300)
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        // Aktualizuj kolory na bordowy i błękitny
        .style("fill", d => d.direction === 'up' ? '#0EA5E9' : '#991B1B');

    // ENTER: Dodaj nowe kropki (te, które weszły w zakres)
    dots.enter()
        .append("circle")
        .attr("class", d => "crossings-dot " + d.direction)
        .attr("r", 0) // Rozpocznij z promieniem 0
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .style("stroke", "white")
        .style("stroke-width", 1.5)
        .style("cursor", "pointer")
        .style("fill", d => d.direction === 'up' ? '#0EA5E9' : '#991B1B')
        .on("mouseover", function(event, d) {
             // Dodanie prostego tooltipa po najechaniu
             d3.select(this).attr("r", dotRadius + 2);
             tooltip.style("display", "block")
                    .style("left", `${x(d.date) + margin.left + 15}px`)
                    .style("top", `${y(d.value) + margin.top}px`)
                    .html(`Przecięcie: ${d.direction === 'up' ? 'Wzrostowe' : 'Spadkowe'}<br>${d.date.toISOString().slice(0, 10)}`);
        })
        .on("mouseout", function(event, d) {
             d3.select(this).attr("r", dotRadius);
             tooltip.style("display", "none");
        })
        .transition().duration(300)
        .attr("r", dotRadius); // Animacja do pełnego rozmiaru
}

drawCrossingsDots(crossingsData, x.domain());

// Define the slider
const sliderRange = d3
    .sliderBottom()
    .min(d3.min(data, d => d.Date))
    .max(d3.max(data, d => d.Date))
    .width(1435)
    .tickFormat(d3.timeFormat('%Y-%m-%d'))
    .ticks(3)
    .default([d3.min(data, d => d.Date), d3.max(data, d => d.Date)])
    .fill('#85bb65');


  sliderRange.on('onchange', val => {
    // Set new domain for x scale
    x.domain(val);

    // Filter data based on slider values
    const filteredData = data.filter(d => d.Date >= val[0] && d.Date <= val[1]);
    const filteredRm200Data = rm200DataCurrent.filter(d => d.Date >= val[0] && d.Date <= val[1]);
    const filteredRm30Data = rm30DataCurrent.filter(d => d.Date >= val[0] && d.Date <= val[1]);

    // Set new domain for y scale based on new data
    y.domain([0, d3.max(filteredData, d => d.Price)]);

    // Update the line and area to new domain
    svg.select(".line").attr("d", line(filteredData));
    svg.select(".area").attr("d", area(filteredData));
    svg.select(".line-rm200").attr("d", lineRm200(filteredRm200Data));
    svg.select(".line-rm30").attr("d", lineRm30(filteredRm30Data));


    // Update the x-axis with new domain
    svg.select(".x-axis")
      .transition()
      .duration(300) // transition duration in ms
      .call(d3.axisBottom(x)
        .tickValues(x.ticks(d3.timeYear.every(1)))
        .tickFormat(d3.timeFormat("%Y")));

    // Update the y-axis with new domain
    svg.select(".y-axis")
      .transition()
      .duration(300) // transition duration in ms
      .call(d3.axisRight(y)
        .ticks(10)
        .tickFormat(d => {
          if (d <= 0) return "";
          return `$${d.toFixed(2)}`;
        }));

  });


// --- TOGGLE SHIFT HANDLER ---
function toggleShift(event) {
    // ... (Twój kod zmiany rm30DataCurrent / rm200DataCurrent) ...

    // zaktualizuj widoczną część linii zgodnie z aktualnym zakresem osi X
    const domain = x.domain();
    const filteredRm30 = rm30DataCurrent.filter(d => d.Date >= domain[0] && d.Date <= domain[1]);
    const filteredRm200 = rm200DataCurrent.filter(d => d.Date >= domain[0] && d.Date <= domain[1]);

    // *** C. AKTUALIZACJA PRZY ZMIANIE TOGGLE (POPRAWIONE) ***
    // Tutaj nie zmieniasz danych crossings, ale zmieniasz skalowanie linii RM.
    // Ponowne rysowanie kropek jest potrzebne, by zaktualizować ich pozycję w przypadku
    // zmiany skalowania Y (choć w Twoim kodzie skala Y nie zależy od RM, na wszelki wypadek)
    drawCrossingsDots(crossingsData, domain);

    // ... (Twój kod aktualizacji linii rm30 / rm200) ...
}


  // --- added: shift helper + toggle handler ---
function shiftRmBySamples(originalRmArray, samples) {
  const n = Number.parseInt(samples, 10);
  if (!Number.isInteger(n) || n === 0)
    return originalRmArray.map(d => ({ Date: new Date(d.Date), Price: d.Price }));

  return originalRmArray.map((d, i) => {
    const srcIndex = i + n; // left shift: take value from future index earlier
    const price = (srcIndex >= 0 && srcIndex < originalRmArray.length)
      ? originalRmArray[srcIndex].Price
      : NaN;
    return { Date: new Date(d.Date), Price: price };
  });
}

function toggleShift(event) {
    const isChecked = event?.target ? event.target.checked : document.getElementById('shift-toggle')?.checked;
    console.log("Przełącznik został zmieniony, stan:", isChecked);

    if (isChecked) {
      rm30DataCurrent = shiftRmBySamples(rm30DataOriginal, 15); // przesunięcie o 15 próbek w lewo
      rm200DataCurrent = shiftRmBySamples(rm200DataOriginal, 100); // przesunięcie o 100 próbek w lewo
    } else {
      rm30DataCurrent = rm30DataOriginal.slice();
      rm200DataCurrent = rm200DataOriginal.slice();
    }

    // zaktualizuj widoczną część linii zgodnie z aktualnym zakresem osi X
    const domain = x.domain();
    const filteredRm30 = rm30DataCurrent.filter(d => d.Date >= domain[0] && d.Date <= domain[1]);
    const filteredRm200 = rm200DataCurrent.filter(d => d.Date >= domain[0] && d.Date <= domain[1]);

 const visibleCrossings = crossingsData.filter(d => d.date >= domain[0] && d.date <= domain[1]);
    //Wizualizacja przecięć
const dotRadius = 5; // Promień kropki

svg.selectAll(".crossings-dot")
    .data(crossingsData) // Używamy danych z poprawną wartością Y
    .enter()
    .append("circle")
    .attr("class", d => "crossings-dot " + d.direction) // Dodanie klasy dla up/down
    .attr("r", dotRadius)
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.value))
    .style("fill", d => d.direction === 'up' ? 'green' : 'red');

    // Debug
console.log('crossingsData total:', crossingsData.length, 'visible:', visibleCrossings.length, visibleCrossings);

    svg.select(".line-rm30")
      .transition()
      .duration(300)
      .attr("d", lineRm30(filteredRm30));

    svg.select(".line-rm200")
      .transition()
      .duration(300)
      .attr("d", lineRm200(filteredRm200));
}

  // Add the slider to the DOM
  const gRange = d3
    .select('#slider-range')
    .append('svg')
    .attr('width', 1800)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(90,30)');

  gRange.call(sliderRange);


// Tytuł wykresu
svg.append("text")
  .attr("class", "chart-title")
  .attr("x", -margin.left + 10)
  .attr("y", -margin.top / 2)
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .style("font-family", "sans-serif")
  .text("BTC price chart");

// Źródło danych
svg.append("text")
  .attr("class", "source-credit")
  .attr("x", width - 110)
  .attr("y", height + margin.bottom - 7)
  .style("font-size", "12px")
  .style("font-family", "sans-serif")
  .text("Source: Coin Geko");

// Poczekaj, aż DOM zostanie załadowany, a następnie dodaj nasłuchiwanie:

const shiftToggle = document.getElementById('shift-toggle');
if (shiftToggle) {
  shiftToggle.addEventListener('change', toggleShift);
  // apply current state on load
  if (shiftToggle.checked) toggleShift({ target: shiftToggle });
  console.log("Nasłuchiwanie zdarzeń dla przełącznika zostało dodane.");
}
