

const select = d3.select;
const json = d3.json;
const geoPath = d3.geoPath;
const geoMercator = d3.geoMercator;
const pathGenerator = geoPath();
const feature = topojson.feature;
const newColor = d3.schemeOrRd[9]




//*****************************************************
//************* Width and Height of Map ***************
//****************************************************/

var margin = { top: 20, right: 30, bottom: 30, left: 50},
    width = 990 - margin.right - margin.left,
    height = 710 - margin.top - margin.bottom;

 /********************************************************
  ****************** the map and Zoom ********************
  ********************************************************/
 

 const svg = select('.container')
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)  // .attr('viewBox', `0 0 1000 680`)
    .append('g')
    .attr('class', 'svg-power')
    .call(d3.zoom().on('zoom', () => {
        svg.attr('transform', d3.event.transform)
 }))

   
/*********************************************************
 ****grabs the education and county data from json *******
 *********************************************************/

    
const County = json('assets/data/counties.json')
const Education = json('assets/data/for-user-education.json')

Promise.all([County, Education])
    .then((data) => {
        let countyData = data[0]
        let educational = data[1]
    
    const counties = feature(countyData, countyData.objects.counties)
    
        
/********************************************************************
 ***************************** map colors ***************************
 ********************************************************************/
           
   const colorScale = d3.scaleLinear()
        .domain([6, 48])
        .range(['brown', 'burlywood'])   
   
/*********************************************************************
 ***************************** Counties ******************************
 *********************************************************************/


       svg.selectAll('path')
        .data(counties.features)
        .enter()
        .append('path')
            .attr('class', 'county')
            .attr('d', pathGenerator)
            .attr('data-fips', (d) => {
                let currentCounty = educational.filter(n => n.fips === d.id)
                return currentCounty[0].fips
            })
            .attr('data-education', (d) => {
                let currentCounty = educational.filter(n => n.fips === d.id)
                return currentCounty[0].bachelorsOrHigher
            })
            .attr('fill', (d) => {
                let currentCounty = educational.filter(n => n.fips === d.id)
                return colorScale(currentCounty[0].bachelorsOrHigher)
            })
            .attr('stroke', 'black')

        /*****************************************************************
        ************************ TOOLTIP SECTION *************************
        ********************* Data, Counties, and States *****************
        ****************** the States and tooltip apperence **************
        ******************************************************************/        

            .on('mouseover', function (d) {
                let currentCounty = educational.filter(n => n.fips == d.id)
                tooltip.transition()
                .style('opacity', 1)
                tooltip.attr('data-education', currentCounty[0].bachelorsOrHigher)          

                tooltip.html(`${currentCounty[0].area_name}, ${currentCounty[0].state} 
                <br/> Bachelors Degree or Higher: ${currentCounty.length === 0 ? 'N/A' : currentCounty[0].bachelorsOrHigher}${'%'}`)
                    .style('left', (`${d3.event.pageX - 5}px`))
                    .style('top', (`${d3.event.pageY + 5}px`))
            })
            .on('mouseleave', function (d) {
                tooltip.transition()
                .style('opacity', 0)
            })      

        const tooltip = d3.select('#map')
            .append('div')
            .attr('id', "tooltip")
            .style('position', 'absolute')
            .style('background-color', 'black')
            .style('padding', '5px 15px')
            .style('border-radius', '5px')
            .style('opacity', '0')
            .style('z-index', 2)
            .style('color', 'burlywood')

/********************* State Outline *******************************************/       
       svg.append('path')
            .datum(topojson.mesh(countyData, countyData.objects.states, 
            function(a,b){
                return a !== b
       }))
            .attr('d', pathGenerator)  
            .attr('fill', "none")
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
      
       

/**********************************************************************************
 * ******************************** LEGEND SECTION ********************************
 * ********************************************************************************/

/********************************* Legend Scale ***********************************/ 
let legend = svg.selectAll('g.legend')
    .data([100, 95, 85, 75, 65, 55, 45, 35, 25, 15])
    .enter().append('g')
    .attr('class', 'legend')
    .attr('id', 'legend')
    .attr('transform', 'translate(-300, 100)') 

/****************************** Position and Apperence ****************************/
var legendW = 30, legendH = 40

    legend.append('rect')
        .attr('x', (d, i) => 100)
        .attr('y', (d, i) => 105 + (i * legendH) - legendH )
        .attr('width', legendW)
        .attr('height', legendH)
        .style('fill', d => colorScale(d))
        .attr('data-num', d => d)
        .attr('stroke', 'white')      

/******************************* Text and Numbers **********************************/        
    legend.append('text')
        .attr('x', 135)
        .attr('y', (d, i) => 134 + (i * legendH) - legendH)
        .text((d, i) => d + '%')
        .style('font-size', '20px')
        .style('fill', 'aqua')             

});


    