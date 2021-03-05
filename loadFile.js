document.getElementById('file-input').addEventListener('change', readSingleFile, false);

var DATA = {name:"", line:"", pattern:"", state:"", dut:"", lines:"", dutList:""};

function readSingleFile(event) {
  var file = event.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(event) {
    var contents = event.target.result;
    document.getElementById("pattern-container").innerHTML = "";
    loopRead(contents);
  };
  reader.readAsText(file);
}

function loopRead(contents){
  var lines = contents.split('\n');
  var patternList = [];
  var lineIndex = [];
  var element = document.getElementById('pattern-container');
  var lineCount = 0;
  var loopCount = 1;
  var loopIndex = [];
  var dutCount = false;
  var dutList = [];
  var dutState;
  var dutArray = [];
  var dutIndex = [];

  for(var i in lines) {
      
    if(!lines[i].includes("Loop ")){
      var patternString = lines[i].split(" ");
      var stateCount = 0;
      dutArray = [];
      if (patternString[0]) {
        patternList.push(patternString[0]);
        lineIndex.push(lineCount);
        loopIndex.push(loopCount);
        dutIndex.push(dutArray);
    }
        
        
    } else {
      var patternString = lines[i].split(" ");
      var loopString = patternString[1].split(",");
      loopCount = loopString[0];
      var failString = lines[i].split(",");
      
      var dutState;

      if (failString[3].includes(" Failures 1")){
        dutArray.push("FAIL")
      } else if (failString[3].includes(" Failures 0")) {
        dutArray.push("PASS")
      } else if (failString[3].startsWith(" TDO was Not found")) {
        dutArray[stateCount] = "DISABLED"
        stateCount += 1;
      } else if (failString[3].startsWith(" TDO DUT was disabled")){
        dutArray[stateCount] = "OFF";
        stateCount += 1;
      } else {
        stateCount += 1;
      }

        //Populate DUT list

      if(!dutCount) {
        var dutString = patternString[3].split(",");
        if (!dutList.includes(dutString[0])) {
          dutList.push(dutString[0]);
        } else {
          dutCount = true;
        }
      }

    }
    lineCount+=1;
  }

  for (var i in patternList) {
    var text = document.createTextNode(patternList[i]+ " Loop " + loopIndex[i])
    element.appendChild(text);
    
    for (var j in dutList){
      var btn = createButton(dutList[j], lineIndex[i], patternList[i], dutIndex[i][j], j);
      element.appendChild(btn);
    }
 
    element.appendChild(document.createElement("br"));

  }


  
  function createButton(name, line, pattern, state, dut) {

    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-sm");
    
    if (state == "PASS") {
        button.classList.add("btn-green");
      } else if (state == "FAIL") {
        button.classList.add("btn-red");
      } else if (state == "OFF") {
        button.classList.add("btn-black")
      } else if (state == "DISABLED") {
        button.classList.add("btn-gray")
      }

    button.innerHTML=name;

    button.onclick = function () {
      ICXSBFT(name, line, pattern, state, dut, lines, dutList);

      DATA.name = name;
      DATA.line = line;
      DATA.pattern = pattern;
      DATA.state = state;
      DATA.dut = dut;
      DATA.lines = lines;
      DATA.dutList = dutList;
    };

  return button

  }

}

function coresOnclick() {

  if(document.getElementById('file-input').files.length==0)return

  var cores = document.getElementById("Cores").options[document.getElementById("Cores").selectedIndex].value;
  ICXSBFT(DATA.name, DATA.line, DATA.pattern, DATA.state, DATA.dut, DATA.lines, DATA.dutList);

}


function lineButton(line) {

    var failingDiv = document.getElementById('fails');
    var button = document.createElement("button");
    button.classList.add("btn");
    button.classList.add("btn-sm");
    button.classList.add("line-buttons");

    button.innerHTML=line;


    button.onclick = function () {
      var lineString = "line " + line;
      console.log(lineString)
      //var lineMatch = $("span:contains(lineString)");
      //$( "span:contains('line 81')" ).addClass( "highlighted" );
      //$("span:contains(lineString)").first().prepend('<a class="highlighted" name="hightlighted" />');
      //window.location.hash = '#highlighted';
      $( "span" ).each(function( index ) {

         if ($(this).text().trim() == lineString) {
            var offset = $("#output-div").height()/2;
            $("#output-div").scrollTop(0);
            //offset = (offset > $(this).position().top) ? offset : 0;
            if (offset > $(this).position().top) {
              offset = 0;
            }

            
            $("#output-div").scrollTop($(this).position().top - offset);
            console.log($(this).position().top)
 
         }
        
          });

  
      //lineMatch.scrollIntoView();
      //$(window).scrollTop($("span:contains(lineString):last").offset().top);
      //$(document.getElementById("output-div")).scrollTop(100);
    }

    failingDiv.appendChild(button);
    failingDiv.appendChild(document.createElement("br"));
  }

function ICXSBFT(name, line, pattern, state, dut, lines, dutList) {
      var rawOutput = lines[line + dutList.length + parseInt(dut) + 1].split(" ");
      rawOutput = rawOutput[7];
      //document.getElementById("output-div").innerHTML = output;
      var cores = document.getElementById("Cores").options[document.getElementById("Cores").selectedIndex].value;
      var output = document.getElementById("output-div");
      var failing = document.getElementById("fails");
      var patternName = document.getElementById("pattern-name-div");
      output.innerHTML = "";
      failing.innerHTML = "";
      var lineOutput;
      var outputLineCount = 1;
      var coreSlice;
      var colorToggle = true;
      var failingLines = [];
      var failCount;
      var failBool = false;

      var bitlength = 5;
      var passingBit = "10010";

      patternName.innerHTML = pattern + " DUT#" + (parseInt(dut)+1) + "  ";

      for (i=0; i<((rawOutput.length)/(cores*bitlength))-1; i++){
          
        lineOutput = rawOutput.slice(cores*bitlength*i,cores*bitlength*(i+1));
        failBool=false;
        for (j=0; j<(lineOutput.length/bitlength); j++){
          coreSlice = lineOutput.slice(bitlength*j,bitlength*(j+1));
          
          if (coreSlice != passingBit) {
            coreSlice = document.createTextNode(coreSlice);
            var redSpan = document.createElement('span');
            redSpan.className = 'failing-core';
            redSpan.appendChild(coreSlice);
            output.appendChild(redSpan);
            failBool = true;
            colorToggle = !colorToggle;
          }
          else if (colorToggle) {
            coreSlice = document.createTextNode(coreSlice);
            var graySpan = document.createElement('span');
            graySpan.className = 'gray-toggle';
            graySpan.appendChild(coreSlice);
        
            output.appendChild(graySpan);
            //console.log("true");
            colorToggle = !colorToggle;
          } else {
            coreSlice = document.createTextNode(coreSlice);
            var whiteSpan = document.createElement('span');
            whiteSpan.className = 'white-toggle';
            whiteSpan.appendChild(coreSlice);
            output.appendChild(whiteSpan);
            colorToggle = !colorToggle;
            //console.log("false");

          }

        }
        var lineOutput = document.createTextNode("   line " + outputLineCount + "\n");
        if (failBool) {
          failingLines.push(outputLineCount);
          failCount = document.createTextNode(outputLineCount + "\n");
          lineButton(outputLineCount);
          //failing.appendChild(failCount);
        }
        var lineP = document.createElement("span");
        lineP.appendChild(lineOutput);
        output.appendChild(lineP);
        outputLineCount += 1;
        colorToggle = true;
      }


    }
