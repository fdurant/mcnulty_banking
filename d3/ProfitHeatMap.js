var defaultAvgCostPerContactForHeatmap = 10;
var costSliderForHeatmap = d3.slider()
    .min(5)
    .max(50)
    .showRange(true)
    .ticks(10)
    .value(defaultAvgCostPerContactForHeatmap)
    .stepValues([5,10,15,20,25,30,35,40,45,50]);

var costCallbackFnForHeatmap = function(costSlider) {
    //    console.log("selected cost = " + costSlider.value())
    d3.select('#avgCostPerContactSliderForHeatmapText').text(costSlider.value());
    recomputeAndRedrawHeatmap()
};

var avgCostPerContactSliderForHeatmap = d3.select('#avgCostPerContactSliderForHeatmap').call(costSliderForHeatmap);
costSliderForHeatmap.callback(costCallbackFnForHeatmap);


var defaultAvgRevenuePerContactForHeatmap = 50;
var revSliderForHeatmap = d3.slider()
    .min(5)
    .max(150)
    .showRange(true)
    .ticks(15)
    .value(defaultAvgRevenuePerContactForHeatmap)
    .stepValues([10,20,30,40,50,60,70,80,90,100,110,120,130,140,150]);

var revCallbackFnForHeatmap = function(revSlider) {
    //    console.log("selected revenue = " + revSlider.value())
    d3.select('#avgRevenuePerContactSliderForHeatmapText').text(revSlider.value())
    recomputeAndRedrawHeatmap()
};

var avgRevenuePerContactSliderForHeatmap = d3.select('#avgRevenuePerContactSliderForHeatmap')
    .call(revSliderForHeatmap);
revSliderForHeatmap.callback(revCallbackFnForHeatmap);

/* Heavily inspired by http://nvd3.org/examples/line.html */

var margin = { top: 20, right: 20, bottom: 50, left: 20 },
//  cellSize=12;
  cellSize=8;
  col_number=100;
  row_number=42;
  width = cellSize*col_number, // - margin.left - margin.right,
  height = cellSize*row_number, // - margin.top - margin.bottom,
  //gridSize = Math.floor(width / 24),
  legendElementWidth = cellSize*2.5,
  // Dark green to dark red, kind of, with white in the middle
  colors = ['#91003F','#9B1A53','#A63467','#B14F7C','#BB6990','#C684A4','#D19EB9','#DBB9CD','#E6D3E1','#F1EEF6','#FFFFFF','#EDF8FB','#D2E6E3','#B8D4CB','#9EC2B3','#83B09B','#699F83','#4F8D6B','#347B53','#1A693B','#005824'];

rowLabel = Array.apply(null, {length: row_number}).map(Number.call, Number)
colLabel = Array.apply(null, {length: col_number}).map(Number.call, Number)

d3.select("#model").on("change",function(){
	recomputeAndRedrawHeatmap();
    });

d3.select("#profittype").on("change",function(){
	recomputeAndRedrawHeatmap();
    });

function getBaseLog(x, y) {
    if (y == 0) {
	return 0;
    }
    else {
	return Math.log(y) / Math.log(x);
    }
}

var svg = d3.select("#profitheatmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

var colorScale = d3.scale.quantile()
    .domain([ -10 , 0, 10])
    .range(colors);

function recomputeAndRedrawHeatmap() {

d3.json("ProfitCurve.json", function(error, json) {
	
	var mySortedProfitsPerModel = [];

	var modelName = d3.select('#model').node().value;
	var profitType = d3.select('#profittype').node().value;

	var sortedProbsAndTrueLabels = json[modelName]['sortedProbsAndTrueLabels']; // Array of arrays containing (prob, true_label, id)

	var avgCostPerContactFromSliderForHeatmap = d3.select('#avgCostPerContactSliderForHeatmapText').text();
	var avgRevenuePerContactFromSliderForHeatmap = d3.select('#avgRevenuePerContactSliderForHeatmapText').text();

	//	console.log("modelName is " + modelName);
	//	console.log("avgCostPerContactFromSliderForHeatmap is " + avgCostPerContactFromSliderForHeatmap) ;
	//	console.log("avgRevenuePerContactFromSliderForHeatmap is " + avgRevenuePerContactFromSliderForHeatmap);
	//	console.log("sortedProbsAndTrueLabels.slice(0,3) is ");
	//	console.log(sortedProbsAndTrueLabels.slice(0,3));

	var calculatedProfits = calculateProfits(sortedProbsAndTrueLabels,
						 sortedProbsAndTrueLabels.length, // We have 1-element "percentiles" !!! 
						 1, 
						 avgCostPerContactFromSliderForHeatmap,
						 avgRevenuePerContactFromSliderForHeatmap);

	//	console.log("calculatedProfits.slice(0,3) is ");
	//	console.log(calculatedProfits.slice(0,4));

	values = [];

	for (var i = 1; i < calculatedProfits.length; i++) {

	    var instanceID = calculatedProfits[i][7];
	    cumulativeProfit = Math.floor(calculatedProfits[i][3]);
	    intervalProfit = Math.floor(calculatedProfits[i][6]);
	    var row = Math.floor((i-1) / col_number);
	    var col = Math.floor((i-1) % col_number);
	    var maxAbsoluteHeatval = Math.floor(colors.length / 2);
	    var heatVal = 0;
	    if (profitType == 'cumulative') {
		if (cumulativeProfit >= 0) {
		    heatVal = Math.min(Math.floor(getBaseLog(3,cumulativeProfit)),
				       maxAbsoluteHeatval);
		}
		else {
		    heatVal = (-1 * Math.min(Math.floor(getBaseLog(3,cumulativeProfit * -1)),
					     maxAbsoluteHeatval));
		}
	    }
	    else {
		// profitType == single
		heatVal = Math.floor(intervalProfit / 10);
	    }

	    values.push({row: row,
			col: col,
			id: instanceID,
			cumProfit: cumulativeProfit,
			intervalProfit: intervalProfit,
			heatVal: heatVal,
			rank: i});
	}
	
	console.log("model " + modelName + ":");
	console.log(values.slice(3));

	var rowSortOrder=false;
	var colSortOrder=false;
	var rowLabels = svg.append("g")
	    .selectAll(".rowLabel")
	    .data(rowLabel)
	    .enter()
	    .append("text")
	    .text(function (d) { return d; })
	    .attr("x", 0)
	    .attr("y", function (d, i) { return d * cellSize; })
	    //	    .attr("y", function (d, i) { return hcrow.indexOf(i+1) * cellSize; })
	    .style("text-anchor", "end")
	    .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
	    .attr("class", function (d,i) { return "rowLabel mono r"+i;} ) 
	    //      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
	    //      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
	    .on("click", function(d,i) {rowSortOrder=!rowSortOrder; sortbylabel("r",i,rowSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
	    ;
	
	//	return values;

	var colLabels = svg.append("g")
	    .selectAll(".colLabelg")
	    .data(colLabel)
	    .enter()
	    .append("text")
	    .text(function (d) { return d; })
	    .attr("x", 0)
	    .attr("y", function (d, i) { return d * cellSize; })
	    .style("text-anchor", "left")
	    .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
	    .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
	    //      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
	    //      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
	    .on("click", function(d,i) {colSortOrder=!colSortOrder;  sortbylabel("c",i,colSortOrder);d3.select("#order").property("selectedIndex", 4).node().focus();;})
	    ;
	
	var heatMap = svg.append("g").attr("class","g3")
	    .selectAll(".cellg")
	    .data(values)
	    //	    .data(values,function(d){return d.row+":"+d.col+":"+d.id+":"+d.cumProfit+":"+d.heatVal;})
	    .enter()
	    .append("rect")
	    //	    .attr("x", function(d) { return hccol.indexOf(d.col) * cellSize; })
	    //	    .attr("y", function(d) { return hcrow.indexOf(d.row) * cellSize; })
	    .attr("x", function(d) { return d.col * cellSize; })
	    .attr("y", function(d) { return d.row * cellSize; })
	    .attr("class", function(d){return "cell cell-border cr"+(d.row-1)+" cc"+(d.col-1);})
	    .attr("width", cellSize)
	    .attr("height", cellSize)
	    .style("fill", function(d) { return colorScale(d.heatVal); })
	    /* .on("click", function(d) {
               var rowtext=d3.select(".r"+(d.row-1));
               if(rowtext.classed("text-selected")==false){
	       rowtext.classed("text-selected",true);
               }else{
	       rowtext.classed("text-selected",false);
               }
	       })*/
	    .on("mouseover", function(d){
		    //highlight text
		    d3.select(this).classed("cell-hover",true);
		    d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
		    d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});
		    
		    //Update the tooltip position and value
		    d3.select("#heatmaptooltip")
		    .style("left", (d3.event.pageX+10) + "px")
		    .style("top", (d3.event.pageY-10) + "px")
		    .select("#value")
		    //		    .text("point:"+d.row+","+d.col+"\ncumulative profit:"+d.cumProfit+"\ninstance ID:"+d.id+"\nheatVal:"+d.heatVal);
		    .text("this customer (rank " + d.rank + ") contributes " + d.intervalProfit + " USD; the cumulative profit/loss is: "+d.cumProfit+" USD");
		    //Show the tooltip
		    d3.select("#heatmaptooltip").classed("hidden", false);
		})
	    .on("mouseout", function(){
		    d3.select(this).classed("cell-hover",false);
		    d3.selectAll(".rowLabel").classed("text-highlight",false);
		    d3.selectAll(".colLabel").classed("text-highlight",false);
		    d3.select("#heatmaptooltip").classed("hidden", true);
		})
	    ;
	
	var legend = svg.selectAll(".legend")
	    .data([-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10])
	    .enter().append("g")
	    .attr("class", "legend");
	    
	legend.append("rect")
	    .attr("x", function(d, i) { return legendElementWidth * i; })
	    .attr("y", height+(cellSize*2))
	    .attr("width", legendElementWidth)
	    .attr("height", cellSize)
	    .style("fill", function(d, i) { return colors[i]; });
	
	legend.append("text")
	    .attr("class", "mono")
	    .text(function(d) { return d; })
	    .attr("width", legendElementWidth)
	    .attr("x", function(d, i) { return legendElementWidth * i; })
	    .attr("y", height + (cellSize*4));
	
    })
    }
    ;

recomputeAndRedrawHeatmap();
