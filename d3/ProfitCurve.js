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
    .max(100)
    .showRange(true)
    .ticks(19)
    .value(defaultAvgRevenuePerContact)
    .stepValues([5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]);

var revCallbackFn = function(revSlider) {
    //    console.log("selected revenue = " + revSlider.value())
    d3.select('#avgRevenuePerContactSliderText').text(revSlider.value())
    recomputeAndRedraw()
};

var avgRevenuePerContactSlider = d3.select('#avgRevenuePerContactSlider')
    .call(revSlider);
revSlider.callback(revCallbackFn);

/* Borrowed here: http://stackoverflow.com/questions/8495687/split-array-into-chunks*/
Array.prototype.chunk = function(chunkSize) {
    var R = [];
    for (var i=0; i<this.length; i+=chunkSize)
        R.push(this.slice(i,i+chunkSize));
    return R;
}

function calculateProfits(sortedProbsAndTrueLabels, nrPercentiles, posLabel, avgCostPerContact, avgRevenuePerContact) {

    /*
      Inputs are:
      - sortedProbsAndTrueLabels: an array of arrays containing (probability, true_label), sorted in descending order by probability
      - posLabel (typically 1)
      - average cost per contact
      - average revenue per contact

      Output is an array of arrays of the form
      (percentOfTargetPopulationInThisPercentile,
      cumulative revenue,
      cumulative cost,
      cumulative profit,
      revenue for this percentile,
      cost for this percentile,
      profit for this percentile)
      
    */

    var result = [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]];

    var numberOfPositiveInstances = 0;
    for (var i = 0; i < sortedProbsAndTrueLabels.length; i++) {
	if (sortedProbsAndTrueLabels[i][1] === posLabel) {
	    numberOfPositiveInstances++;
	}
    }

    var percentileSplitOfInstances = sortedProbsAndTrueLabels.chunk(Math.ceil(sortedProbsAndTrueLabels.length / nrPercentiles));

    var cumulativeCost = 0.0;
    var cumulativeRevenue = 0.0;
    var cumulativeProfit = 0.0;

    for (var c = 0; c < percentileSplitOfInstances.length; c++) {
	var percentile = percentileSplitOfInstances[c];
	var nrPositivesInPercentile = 0;
	var nrNegativesInPercentile = 0;
	for (var e = 0; e < percentile.length; e++) {
	    var prob = percentile[e][0];
	    var trueLabel = percentile[e][1];
	    if (trueLabel == posLabel) {
		nrPositivesInPercentile++;
	    }
	    else {
		nrNegativesInPercentile++;
	    }
	}
	
	//	console.log("nrPositivesInPercentile:" + nrPositivesInPercentile);
	//	console.log("nrNegativesInPercentile:" + nrNegativesInPercentile);

        var p = (c+1)/nrPercentiles;
        var costThisPercentile = avgCostPerContact * (nrPositivesInPercentile + nrNegativesInPercentile);
        var revenueThisPercentile = avgRevenuePerContact * nrPositivesInPercentile;
        var profitThisPercentile = revenueThisPercentile - costThisPercentile;

        var cumulativeRevenue = cumulativeRevenue + revenueThisPercentile;
        var cumulativeCost = cumulativeCost + costThisPercentile;
        var cumulativeProfit = cumulativeProfit + profitThisPercentile;

        result.push([p*100, 
		     cumulativeRevenue, 
		     cumulativeCost, 
		     cumulativeProfit, 
		     revenueThisPercentile, 
		     costThisPercentile, 
		     profitThisPercentile]);

    }

    //    console.log("numberOfPositiveInstances:" + numberOfPositiveInstances);
    //    console.log("percentileSplitOfInstances.length: " + percentileSplitOfInstances.length);

    return result;
}

/* Heavily inspired by http://nvd3.org/examples/line.html */

function recomputeAndRedraw() {

d3.json("ProfitCurve.json", function(error, json) {
	
	// json has the following structure:
	/*
	  
	  {"modelName_1": {"xPerc": [ 10.0, 50.0, 100.0 ],
                           "yProfit": [ 1000.0, 5000.0, 10000.0 ],
                           "cumProfit": [ 1000.0, 5000.0, 10000.0 ]
                           "intervalProfit": [ 1000.0, 4000.0, 5000.0 ]},
	   "modelName_2": {"xPerc": [ 10.0, 50.0, 100.0 ],
                           "yProfit": [ 1000.0, 5000.0, 10000.0 ],
                           "cumProfit": [ 1000.0, 5000.0, 10000.0 ]
                           "intervalProfit": [ 1000.0, 4000.0, 5000.0 ]}
	  }
	  
	  where modelName is one of: 'knn', 'logres', 'gaussianNB' and 'baseline'
	  
	*/
	
	var mydata = [];
    
	for (var modelName in json) {

	    //	    var xPerc = json[modelName]['xPerc']; // Array of float
	    //var yProfit = json[modelName]['yProfit']; // Array of float
	    //var intervalProfit = json[modelName]['intervalProfit']; // Array of float
	    var sortedProbsAndTrueLabels = json[modelName]['sortedProbsAndTrueLabels']; // Array of arrays containing (prob, true_label)

	    var avgCostPerContactFromSlider = d3.select('#avgCostPerContactSliderText').text();
	    var avgRevenuePerContactFromSlider = d3.select('#avgRevenuePerContactSliderText').text();

	    var calculatedProfits = calculateProfits(sortedProbsAndTrueLabels,
						     20, 
						     1, 
						     avgCostPerContactFromSlider,
						     avgRevenuePerContactFromSlider);

	    //Data is represented as an array of {x,y} pairs.
	    var values = [];
	
	    for (var i = 0; i < calculatedProfits.length; i++) {
		values.push({x: Math.floor(calculatedProfits[i][0]), y: Math.floor(calculatedProfits[i][3]), intervalProfit: Math.floor(calculatedProfits[i][6])});
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

recomputeAndRedraw(10,50);