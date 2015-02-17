/* Heavily inspired by http://nvd3.org/examples/line.html */

d3.json("LiftCurve.json", function(error, json) {
	
	// json has the following structure:
	/*
	  
	  {"modelName_1": {"xPerc": [ 10.0, 50.0, 100.0 ],
                           "yPerc": [ 45.0, 75.0, 100.0 ],
                           "lifts": [ 4.5, 1.5, 1.0 ]},
	   "modelName_2": {"xPerc": [ 10.0, 50.0, 100.0 ],
                           "yPerc": [ 45.0, 75.0, 100.0 ],
                           "lifts": [ 4.5, 1.5, 1.0 ]}
	  }
	  
	  where modelName is one of: 'knn', 'logres', 'gaussianNB' and 'baseline'
	  
	*/
	
	var mydata = [];
    
	for (var modelName in json) {

	    var yPerc = json[modelName]['yPerc']; // Array of float
	    var xPerc = json[modelName]['xPerc']; // Array of float
	    var lifts = json[modelName]['lifts']; // Array of float
	    
	    //Data is represented as an array of {x,y} pairs.
	    var values = [];
	
	    for (var i = 0; i < xPerc.length; i++) {
		values.push({x: xPerc[i], y: yPerc[i], z: lifts[i]});
	    }
	
	    mydata.push({ 'values': values, 'key': modelName, 'area': false});

	}

	nv.addGraph(function() {

		var chart = nv.models.lineChart()
		    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		    .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
		    //.transitionDuration(350)  //how fast do you want the lines to transition?
		    .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
		    .showYAxis(true)        //Show the y-axis
		    .showXAxis(true)        //Show the x-axis
		    // CONTINUE HERE
		    //		    .tooltips( function(key, x, y, e, graph) {
		    //			    return '<h3>' + key + ' Custom Text Here ' + x + '</h3> here' + '<p> or here ,' + y + '</p>'
		    //			})
		    ;
		
		// OR HERE
		//chart.tooltipContent
		   
		
		chart.xAxis     //Chart x-axis settings
		    .axisLabel('Percentage of test instances (decreasing by probability)')
		    .tickFormat(d3.format('.1f'));
		
		chart.yAxis     //Chart y-axis settings
		    .axisLabel('Percentage of positive instances targeted')
		    .tickFormat(d3.format('.1f'));
		
		d3.select('svg')    //Select the <svg> element you want to render the chart in.   
		    .datum(mydata)         //Populate the <svg> element with chart data...
		    .call(chart);          //Finally, render the chart!
		
		//Update the chart when window resizes.
		nv.utils.windowResize(function() { chart.update() });
		return chart;
	    });
	
    }
    );



