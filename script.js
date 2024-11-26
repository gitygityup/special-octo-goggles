console.log("Script loaded!"); // Confirm the script is running

// Set up the SVG canvas
const width = 1000;
const height = 600;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Add a blur filter for the trail effect
const defs = svg.append("defs");
const filter = defs.append("filter")
    .attr("id", "blur")
    .append("feGaussianBlur")
    .attr("stdDeviation", 5); // Adjust blur intensity

// Adjusted coordinates for better spacing
const coordinates = {
    "Central Equatoria": { x: 150, y: 150 },
    "Western Equatoria": { x: 150, y: 300 },
    "Upper Nile": { x: 150, y: 450 },
    "Sudan (SDN)": { x: 800, y: 150 },
    "Uganda (UGA)": { x: 800, y: 300 },
    "Ethiopia (ETH)": { x: 800, y: 450 }
};

// Top 3 connections (with mode of transport and number of travelers)
const topConnections = [
    { origin: "Central Equatoria", destination: "Uganda (UGA)", travelers: 47497, mode: "Bus" },
    { origin: "Upper Nile", destination: "Sudan (SDN)", travelers: 11490, mode: "Car" },
    { origin: "Western Equatoria", destination: "Ethiopia (ETH)", travelers: 8986, mode: "Walking" }
];

// Modes of transport data (for multiple dots per line)
const modesData = [
    { mode: "Bus", population: 20000, color: "green" },
    { mode: "Car", population: 10000, color: "blue" },
    { mode: "Walking", population: 5000, color: "pink" }
];

// Draw lines for each connection and animate dots with trails
topConnections.forEach(connection => {
    const origin = coordinates[connection.origin];
    const destination = coordinates[connection.destination];

    if (origin && destination) {
        // Create a path for the connection
        const path = svg.append("path")
            .datum([
                [origin.x, origin.y],
                [(origin.x + destination.x) / 2, (origin.y + destination.y) / 2 - 50], // Control point for smooth curve
                [destination.x, destination.y]
            ])
            .attr("d", d3.line().curve(d3.curveBasis))
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2); // the stroke width

        const totalLength = path.node().getTotalLength(); // Calculate the total length of the path

        // here is where to add multiple moving dots with flowing on trails
        modesData.forEach(mode => {
           
            svg.append("circle")
                .attr("r", (mode.population / 3000) * 1.5) // Larger circle for trail effect
                .attr("fill", mode.color)
                .attr("opacity", 0.3) // Faint trail lines
                .attr("filter", "url(#blur)") // Apply blur
                .attr("cx", 0)
                .attr("cy", 0)
                .transition()
                .duration(5000 + Math.random() * 2000) //  duration for variation
                .ease(d3.easeLinear)
                .attrTween("cx", function () {
                    return function (t) {
                        const point = path.node().getPointAtLength(t * totalLength); // position along the path
                        return point.x;
                    };
                })
                .attrTween("cy", function () {
                    return function (t) {
                        const point = path.node().getPointAtLength(t * totalLength); // position along the path
                        return point.y;
                    };
                })
                .on("end", function () {
                    d3.select(this).remove(); // Remove trail after animation ends (how can we keep trail??)
                });

            
            svg.append("circle")
                .attr("r", (mode.population / 3000) * 2.5) // Larger circle for visibility
                .attr("fill", mode.color) // Color based on mode
                .attr("cx", 0)
                .attr("cy", 0)
                .transition()
                .duration(5000 + Math.random() * 2000) // duration for variation
                .ease(d3.easeLinear)
                .attrTween("cx", function () {
                    return function (t) {
                        const point = path.node().getPointAtLength(t * totalLength); // position along the path
                        return point.x;
                    };
                })
                .attrTween("cy", function () {
                    return function (t) {
                        const point = path.node().getPointAtLength(t * totalLength); // position along the path
                        return point.y;
                    };
                })
                .on("end", function () {
                    d3.select(this).remove(); // Remove the dot after animation ends
                });
        });
    }
});

// text labels for each location
Object.keys(coordinates).forEach(location => {
    const { x, y } = coordinates[location];

    svg.append("text")
        .attr("x", x - (x > 500 ? -40 : 40)) // Adjust text position dynamically
        .attr("y", y)
        .attr("dy", "0.35em")
        .text(location)
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("text-anchor", x > 500 ? "start" : "end"); // Adjust alignment
});

// the legend
const legend = svg.append("g")
    .attr("transform", `translate(${width - 250}, ${50})`); // Position the legend

// the title to the legend
legend.append("text")
    .text("Legend")
    .attr("x", 10)
    .attr("y", 0)
    .attr("font-size", "16px")
    .attr("fill", "black");

// the legend items
modesData.forEach((mode, i) => {
    const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${20 + i * 25})`);

    legendRow.append("circle")
        .attr("r", 10) // Fixed size for legend dots
        .attr("fill", mode.color);

    legendRow.append("text")
        .text(`${mode.mode} (${mode.population} people)`)
        .attr("x", 20)
        .attr("y", 5)
        .attr("font-size", "14px")
        .attr("fill", "black");
});
