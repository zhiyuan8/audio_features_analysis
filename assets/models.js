function KNN_decision(mtData_normalized)
{
	// max(rms) without normailization
    var rms_origin = mtData_normalized[0] * normalize_std[0] + normalize_mean[0];   
    if (rms_origin < threshold)   // max(rms) is too low, silence
    {
        score = 0;
        label_text('speech_score', score.toFixed(2)) 
        label_text('speech_non_speech', 'noise')
    }
    else
    {
        score = 0; // make sure to initialize score
        for (var i = 0; i < rowCount; i++) // i means ith wav file or ith label
        {
          dist[i] = 0; // initialize distance as 0
          for (var j = 0; j < colCount; j++) // j means jth feature
          {
              dist[i] = dist[i] + Math.pow ( mtData_normalized[j] - loadData[i][j] , 2);
          }
        dist[i] = Math.pow(dist[i], 0.5);
        }

        // Sort index according to L2 distance
        for (var i = 0; i < rowCount; ++i) 
        {
              indices[i] = i; // renew indices
        }
        
        indices.sort(function (a, b) { return dist[a] < dist[b] ? -1 : dist[a] > dist[b] ? 1 : 0; });// if dist[a]<dist[b], return -1, and so on...

        // calculate score
        for (var i = 0; i < k; i++) 
        {
              score = score + labels[indices[i]]; // add the label with ith largest indice
        }
        score = score / k;

        label_text('speech_score', score.toFixed(2)) 

        // make decision
        if (score <=0.5)
        {
          label_text('speech_non_speech', 'noise')
        }
        else
        {
          label_text('speech_non_speech', 'speech')
        }
    }
}