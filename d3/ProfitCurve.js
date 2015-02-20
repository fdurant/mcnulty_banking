var defaultAvgCostPerContact = 10;
var costSlider = d3.slider()
    .min(5)
    .max(50)
    .showRange(true)
    .ticks(10)
    .value(defaultAvgCostPerContact)
    .stepValues([5,10,15,20,25,30,35,40,45,50]);

var costCallbackFn = function(costSlider) {
    //    console.log("selected cost = " + costSlider.value())
    d3.select('#avgCostPerContactSliderText').text(costSlider.value());
    recomputeAndRedraw()
};

var avgCostPerContactSlider = d3.select('#avgCostPerContactSlider').call(costSlider);
costSlider.callback(costCallbackFn);


var defaultAvgRevenuePerContact = 50;
var revSlider = d3.slider()
    .min(5)
    .max(150)
    .showRange(true)
    .ticks(15)
    .value(defaultAvgRevenuePerContact)
    .stepValues([10,20,30,40,50,60,70,80,90,100,110,120,130,140,150]);

var revCallbackFn = function(revSlider) {
    //    console.log("selected revenue = " + revSlider.value())
    d3.select('#avgRevenuePerContactSliderText').text(revSlider.value())
    recomputeAndRedraw()
};

var avgRevenuePerContactSlider = d3.select('#avgRevenuePerContactSlider')
    .call(revSlider);
revSlider.callback(revCallbackFn);

/* Heavily inspired by http://nvd3.org/examples/line.html */

function recomputeAndRedraw() {

d3.json("ProfitCurve.json", function(error, json) {
	
	var mydata = [];
    
	for (var modelName in json) {

	    var sortedProbsAndTrueLabels = json[modelName]['sortedProbsAndTrueLabels']; // Array of arrays containing (prob, true_label)

	    var avgCostPerContactFromSlider = d3.select('#avgCostPerContactSliderText').text();
	    var avgRevenuePerContactFromSlider = d3.select('#avgRevenuePerContactSliderText').text();

	    var calculatedProfits = calculateProfits(sortedProbsAndTrueLabels,
						     50, 
						     1, 
						     avgCostPerContactFromSlider,
						     avgRevenuePerContactFromSlider);

	    //Data is represented as an array of {x,y} pairs.
	    var values = [];
	
	    for (var i = 0; i < calculatedProfits.length; i++) {
		values.push({x: Math.round(calculatedProfits[i][0]), y: Math.floor(calculatedProfits[i][3]), intervalProfit: Math.floor(calculatedProfits[i][6])});
	    }
	
	    mydata.push({ 'values': values, 'key': modelName, 'area': false});

	}

	nv.addGraph(function() {
		    
		var chart = nv.models.lineChart()
		    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		    .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		    .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		    .showYAxis(true)        //Show the y-axis
		    .showXAxis(true)        //Show the x-axis
		    ;
		
		// Added by Frederik
		
		f = function (key, x, y, e, graph) {
		    //console.log("key = " + key);
		    //console.log("x = " + x);
		    //console.log("y = " + y);

		    htmlTable = ['<table class="nv-pointer-events-none">',
				 '<thead>',
				 '<tr style="background-color: rgb(255,255,255);" class="nv-pointer-events-none">',
				 '<td class="legend-color-guideline"><strong>',
				 'model','</strong></td>',
				 '<td colspan="2" class="nv-pointer-events-none">',
				 '<strong>',key,'</strong>',
				 '</td>',
				 '</tr>',
				 '</thead>',
				 '<tbody>',

				 '<tr class="nv-pointer-events-none">',
				 '<td class="nv-pointer-events-none">top-ranked</td>',
				 '<td class="nv-pointer-events-none">' + x + '</td>',
				 '</tr>',

				 '<tr class="nv-pointer-events-none">',
				 '<td class="nv-pointer-events-none">Cumulative profit</td>',
				 '<td class="nv-pointer-events-none">' + y + '</td>',
				 '</tr>',

				 '<tr class="nv-pointer-events-none">',
				 '<td class="nv-pointer-events-none">Interval profit</td>',
				 '<td class="nv-pointer-events-none">' + (e.point.intervalProfit).toFixed(2) + '</td>',
				 '</tr>',

				 '</tbody>',
				 '</table>'].join('\n');


		    return  htmlTable;

		};
		
		// Added by Frederik
		//chart.tooltipContent(f);

		chart.xAxis     //Chart x-axis settings
		    .axisLabel('Percentage of test instances (decreasing by probability)')
		    .tickFormat(d3.format('d'));
		
		chart.yAxis     //Chart y-axis settings
		    .axisLabel('Profit (in USD)')
		    .tickFormat(d3.format('d'));
		
		d3.select('#profitcurve')    //Select the <svg> element you want to render the chart in.   
		    .datum(mydata)         //Populate the <svg> element with chart data...
		    .call(chart);          //Finally, render the chart!
		
		//Update the chart when window resizes.
		nv.utils.windowResize(function() { chart.update() });
		return chart;
	    });
	
	}
	);

}

recomputeAndRedraw();