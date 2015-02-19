/* Heavily inspired by http://nvd3.org/examples/line.html */

d3.json("LiftCurve.json", function(error, json) {
	
	// json has the following structure:
	/*
	  
	  {"modelName_1": {"xPerc": [ 10.0, 50.0, 100.0 ],
                           "yPerc": [ 45.0, 75.0, 100.0 ],
                           "cumLift": [ 4.5, 1.5, 1.0 ],
                           "localLift": [ 4.5, 3.0, 0.2 ]},
	   "modelName_2": {"xPerc": [ 10.0, 50.0, 100.0 ],
                           "yPerc": [ 45.0, 75.0, 100.0 ],
                           "cumLift": [ 4.5, 1.5, 1.0 ],
                           "localLift": [ 4.5, 3.0, 0.2 ]}
	  }
	  
	  where modelName is one of: 'knn', 'logres', 'gaussianNB' and 'baseline'
	  
	*/
	
	var mydata = [];
    
	for (var modelName in json) {

	    var yPerc = json[modelName]['yPerc']; // Array of float
	    var xPerc = json[modelName]['xPerc']; // Array of float
	    var cumLift = json[modelName]['cumLift']; // Array of float
	    var localLift = json[modelName]['localLift']; // Array of float
	    
	    //Data is represented as an array of {x,y} pairs.
	    var values = [];
	
	    for (var i = 0; i < xPerc.length; i++) {
		values.push({x: xPerc[i], y: yPerc[i], cumLift: cumLift[i], localLift: localLift[i]});
	    }
	
	    mydata.push({ 'values': values, 'key': modelName, 'area': false});

	}

	nv.addGraph(function() {
		    
		var chart = nv.models.lineChart()
		    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
		    .useInteractiveGuideline(false)  //We want nice looking tooltips and a guideline!
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
				 '<td class="nv-pointer-events-none">yield</td>',
				 '<td class="nv-pointer-events-none">' + y + '</td>',
				 '</tr>',

				 '<tr class="nv-pointer-events-none">',
				 '<td class="nv-pointer-events-none">cum. lift</td>',
				 '<td class="nv-pointer-events-none">' + (e.point.cumLift).toFixed(2) + '</td>',
				 '</tr>',

				 '<tr class="nv-pointer-events-none">',
				 '<td class="nv-pointer-events-none">local lift</td>',
				 '<td class="nv-pointer-events-none">' + e.point.localLift.toFixed(2) + '</td>',
				 '</tr>',

				 '</tbody>',
				 '</table>'].join('\n');


		    return  htmlTable;

		};
		
		// Added by Frederik
		chart.tooltipContent(f);
		
		chart.xAxis     //Chart x-axis settings
		    .axisLabel('Percentage of test instances (decreasing by probability)')
		    .tickFormat(d3.format('.1f'));
		
		chart.yAxis     //Chart y-axis settings
		    .axisLabel('Percentage of positive instances targeted')
		    .tickFormat(d3.format('.1f'));
		
		d3.select('#liftcurve')    //Select the <svg> element you want to render the chart in.   
		    .datum(mydata)         //Populate the <svg> element with chart data...
		    .call(chart);          //Finally, render the chart!
		
		//Update the chart when window resizes.
		nv.utils.windowResize(function() { chart.update() });
		return chart;
	    });
	
	}
	);

