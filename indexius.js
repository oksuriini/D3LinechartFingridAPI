document.getElementById("buttontest").addEventListener("click", async (e) =>{

    const idjuttu = document.querySelector('input[name="tyyppi"]:checked').value
    const alkuPvm = document.getElementById("start").value
    const loppuPvm = document.getElementById("end").value

    if(alkuPvm && loppuPvm && idjuttu){
        if((idjuttu == "74" || idjuttu == "75" || idjuttu == "31" || idjuttu == "198")){
            const start = new Date(alkuPvm)
            const end = new Date(loppuPvm)
    
    

            console.log(idjuttu)

            // Here goes your own apikey from Fingrid
            const apiKey = ""
            const headersMy = {
                method: "GET",
                headers: {
                    'x-api-key': apiKey
                },
                redirect: 'follow'
            }
    
            const formatEka = start.toISOString().split('.')[0]+"Z"
            const formatToka = end.toISOString().split('.')[0]+"Z"

            console.log(new Date().getTime())

            const apiUrl = `https://api.fingrid.fi/v1/variable/${idjuttu}/events/json?start_time=${formatEka}&end_time=${formatToka}`

            console.log(formatEka)
            console.log(formatToka)

            if (new Date(end) < new Date(start)){
                window.alert("Aika ei ole kaksi suuntainen. Aloitus päivämäärän pitää olla ennen lopetus päivämäärää.")
            } else if ((new Date(end).getTime() - new Date(start).getTime()) > 5270000000){
                window.alert("Tietoja ei voi antaa yli 2kk ajalta, syötä lyhyempi aikaväli.")
            } else if (new Date(start).getTime() > new Date().getTime() || new Date(end).getTime() > new Date().getTime()){
                window.alert("Vaikka kuinka haluaisin, niin ohjelma ei kuitenkaan pysty ennustamaan tulevaisuutta. Yritäppä uudelleen")
            } else {
                const request = await fetch(apiUrl, headersMy)
                const data = await request.json()
                drawChart(data)
            }
        } else {
            window.alert(`Onnistuit valitsemaan ID:lle arvon ${idjuttu}, joka on laiton id.`)
        }
    } else {
        window.alert(`Joku näistä arvoista on tyhjä.\nAlku päivämäärä: ${alkuPvm}.\nLoppu päivämäärä: ${loppuPvm}.\nHaluttu data: ${idjuttu}.`)
    }
})

async function drawChart(dataset){
    
    d3.selectAll("svg").remove()

                                //2023-03-01T10:00:00+0000
    const dateParser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000")
    const xAccessor = d => dateParser(d.start_time) //Lambda funktio, joka on siis: function d(date). Hakee date avaimen json filusta.
    const yAccessor = d => d.value   //Lambdafunktio, joka on siis: function d(temperatureMax)

    const dimensions = {
        width: window.innerWidth * 0.7,
        height: window.innerHeight* 0.8,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        }
    }

    dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right

    dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom


    const wrapper = d3.select("#chart") 
        .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)

    const boundingBox = wrapper.append("g") 
        .style("transform", `translate(
            ${dimensions.margin.left}px,
            ${dimensions.margin.top}px)`)

    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))
        .range([ 0, dimensions.boundedWidth ])
        

    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0])

    const lineGenerator = d3.line()
        .curve(d3.curveCardinal)
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))

    boundingBox.append("path")
        .attr("d", lineGenerator(dataset))
        .attr("fill", "none")
        .attr("stroke", "black")

    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)

    const xAxis = boundingBox.append("g")
        .call(xAxisGenerator)
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)

    const yAxis = boundingBox.append("g")
        .call(yAxisGenerator)
}

