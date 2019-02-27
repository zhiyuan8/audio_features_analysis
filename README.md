# audio_features_analysis
<p align="center">
  <img src="https://github.com/zhiyuan8/audio_features_analysis/blob/master/img/screen_shot2.png" width="800" title="demo">
</p>  

Real-time audio feature analysis written by Javascript    
The demo for real-time speech/noise classification from web microphone can be found at: https://zhiyuan8.github.io/speech-noise-demo/  
Open the link and press **start**, then your audio features are drawn, and decisions are made every 1s. Press **Export Data** then mid-term features will be shown in a txt file.  

### Training Data
Audios were collected from different resources (see 'Tranining data source' at ReadMe of https://github.com/zhiyuan8/speech_detection).

### Model and Performance
The classification is based on Random Forest model. The author also tried kNN, SVM, decision tree and shallow neural network. Currently Random Forest model outperform others.

### Future Work
Try to use Hidden Markov Chain + Deep Neural Network or Recurring Neural Network to perform automatic speech emotional analysis.  

