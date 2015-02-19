/* Heavily inspired by http://nvd3.org/examples/line.html */

d3.json("ROCCurve.json", function(error, json) {
	
	// json has the following structure:
	/*
	  
	  {"modelName_1": {"thresholds": [ 1.9, 0.5, 0.0 ],
                           "roc_auc": [ 78.5 ],
                           "tpr": [ 0.0, 0.4, 1.0 ],
                           "fpr": [ 0.0, 0.5, 1.0 ]},
	   "modelName_1": {"thresholds": [ 1.9, 0.5, 0.0 ],
                           "roc_auc": [ 78.5 ],
                           "tpr": [ 0.0, 0.4, 1.0 ],
                           "fpr": [ 0.0, 0.5, 1.0 ]}
	  }
	  
	  where modelName is one of: 'knn', 'logres', 'gaussianNB' and 'baseline'
	  
	*/
	
	var mydata = [];
    
	for (var modelName in json) {

	    var tpr = json[modelName]['tpr']; // Array of float
	    var fpr = json[modelName]['fpr']; // Array of float
	    var thresholds = json[modelName]['thresholds']; // Array of float
	    var roc_auc = json[modelName]['roc_auc']; // Float
	    
	    //Data is represented as an array of {x,y} pairs.
	    var values = [];
	
	    for (var i = 0; i < fpr.length; i++) {
		values.push({x: fpr[i], y: tpr[i]});
	    }
	
	    mydata.push({ 'values': values, 'key': modelName + ' (AUC = ' + roc_auc.toFixed(2) + ')', 'area': false});

	}

	nv.addGraph(function() {

		var chart = nv.models.lineChart()
		    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		    .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		    //.transitionDuration(350)  //how fast do you want the lines to transition?
		    .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		    .showYAxis(true)        //Show the y-axis
		    .showXAxis(true)        //Show the x-axis
		    ;
		
		chart.xAxis     //Chart x-axis settings
		    .axisLabel('False Positive Rate (FP/FP+FN)')
		    .tickFormat(d3.format('.02f'));
		
		chart.yAxis     //Chart y-axis settings
		    .axisLabel('True Positive Rate (TP/TP+FN)')
		    .tickFormat(d3.format('.02f'));
		
		
		d3.select('#roccurve')    //Select the <svg> element you want to render the chart in.   
		    .datum(mydata)         //Populate the <svg> element with chart data...
		    .call(chart);          //Finally, render the chart!
		
		//Update the chart when window resizes.
		nv.utils.windowResize(function() { chart.update() });
		return chart;
	    });
	
    }
    );



