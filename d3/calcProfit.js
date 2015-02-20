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

    var result = [[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0]];

    var numberOfPositiveInstances = 0;
    for (var i = 0; i < sortedProbsAndTrueLabels.length; i++) {
	if (sortedProbsAndTrueLabels[i][1] === posLabel) {
	    numberOfPositiveInstances++;
	}
    }

    var percentileSplitOfInstances = [];
    if (nrPercentiles < sortedProbsAndTrueLabels.length) {
	percentileSplitOfInstances = sortedProbsAndTrueLabels.chunk(Math.ceil(sortedProbsAndTrueLabels.length / nrPercentiles));
    }
    else {
	// Just split into 1-element lists
	for (var i = 0; i < sortedProbsAndTrueLabels.length; i++) {
	    percentileSplitOfInstances.push([sortedProbsAndTrueLabels[i]]);
	}
    }

    console.log("percentileSplitOfInstances = ");
    console.log(percentileSplitOfInstances);

    var cumulativeCost = 0.0;
    var cumulativeRevenue = 0.0;
    var cumulativeProfit = 0.0;

    for (var c = 0; c < percentileSplitOfInstances.length; c++) {
	var percentile = percentileSplitOfInstances[c];
	var nrPositivesInPercentile = 0;
	var nrNegativesInPercentile = 0;
	var highestOriginalInstanceIndex = -1;

	for (var e = 0; e < percentile.length; e++) {
	    var prob = percentile[e][0];
	    var trueLabel = percentile[e][1];
	    highestOriginalInstanceIndex = percentile[e][2]; // Only useful for drawing the Profit heatmap
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
		     profitThisPercentile,
		     highestOriginalInstanceIndex]);

    }

    //    console.log("numberOfPositiveInstances:" + numberOfPositiveInstances);
    //    console.log("percentileSplitOfInstances.length: " + percentileSplitOfInstances.length);

    return result;
}
