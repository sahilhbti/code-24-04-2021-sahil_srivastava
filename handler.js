'use strict';

const BMITABLE = [
    {"low":0,"high":18.4,"category":"Underweight","health_risk":"Malnutrition risk"},
    {"low":18.5,"high":24.9,"category":"Normal weight","health_risk":"Low risk"},
    {"low":25,"high":29.9,"category":"Overweight","health_risk":"Enhanced risk"},
    {"low":30,"high":34.9,"category":"Moderately obese","health_risk":"Medium risk"},
    {"low":35,"high":39.9,"category":"Severely obese","health_risk":"High risk"},
    {"low":40,"high":Number.MAX_VALUE,"category":"Very severely obese","health_risk":"Very high risk"},
]

function computeBmi(body){
    /*
    this function will calculation BMI and number of overweight in chunk
    */
    return new Promise(function(resolve,reject){
        try{
        let overweight = 0;
        for(let i=0;i<body.length;i++){

            let _bmi = (body[i]["WeightKg"]*10000)/(body[i]["HeightCm"]*body[i]["HeightCm"]);
            let bmi =  Math.round(_bmi * 10) / 10;
            console.log("bmi is",bmi);
            for(let j=0;j<BMITABLE.length;j++){
                if(bmi>=BMITABLE[j]["low"]&&bmi<=BMITABLE[j]["high"]){
                    body[i]["BMI"] = bmi;
                    body[i]["category"] = BMITABLE[j]["category"];
                    body[i]["health_risk"] = BMITABLE[j]["health_risk"];
                    if(body[i]["category"]=='Overweight'){
                        overweight++;
                    }
                    break;
                }
            }
        }
        console.log("body computeBmi",body);
        resolve({
            "body" : body,
            "overweight" : overweight
        })
        }
        catch(error){
            console.log("error in computeBmi",error);
            reject(error);
        }
    })

}

module.exports.bmiCalculate = async event => {
  try{
      let body = JSON.parse(event.body);
      let chunk_size = 1000
      let allChunk = [];
      for(let i=0;i<body.length;i = i+ chunk_size){
        let myChunk = body.slice(i, i+chunk_size);
        allChunk.push(computeBmi(myChunk));
      }
      let response_allChunk = await Promise.all(allChunk);
      let bmi_result = {
        "body" : [],
        "overweight" : 0
      }
      for(let i=0;i<response_allChunk.length;i++){
            console.log("here");
            console.log(response_allChunk[i].body);
            bmi_result["body"].push(...response_allChunk[i].body);
            bmi_result["overweight"]+=response_allChunk[i]["overweight"];
      }
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: 'Computation successfull!',
            response: bmi_result,
          }
        ),
      };
  }
  catch(error){
    console.log("error in computation",error);
      return {
        statusCode: 200,
        body: JSON.stringify(
        {
            message: 'Computation successfull!',
            response: bmi_result,
        }
        ),
        };
  }
};
