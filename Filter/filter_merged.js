function createFilter(){
	d3.queue()
		.defer(d3.json, "Filter/term6.json")
		.defer(d3.csv, "Filter/member.csv")
		.await(ready);

	function ready(error, dataTerm6, memberData){
		console.log("Merge data: all votes in legco term 6 so far (up tp March 22th 2018)");
		console.log(dataTerm6);

		processFilterData(dataTerm6, memberData);
	}
}
function processFilterData(data, memberData){
	console.log(memberData);
	//generate memeber name list
	var demoMemberList = [];
	var estabMemberList = [];
	memberData.forEach(function(d, i){
		if (+d["camp"] === 0){
			demoMemberList.push(d["_name-en"]);
		} else if (+d["camp"] === 1){
			estabMemberList.push(d["_name-en"]);
		}
	});
	console.log(demoMemberList);
	console.log(estabMemberList);

	var meetingDates = [];
	var choiceOfMotion;
	data["legcohk-vote"]['meeting'].forEach(function(d){
		meetingDates.push(d['_start-date']);
	})
	console.log(meetingDates);

	d3.select("#meetingDates").selectAll("option")
		.data(meetingDates)
		.enter().append("option").attr("value", function(d, i){
			//get the index of meeting
			return i;
		})
		.html(function(d){return d;})

	var choiceOfMeetingDate; //is the int of index of meeting
	d3.select("#meetingDates").on("change", function(){
		//remove motions select
		d3.select("#motions").selectAll("option").remove();
		choiceOfMeetingDate = d3.select(this).property('value');
		var votes = data["legcohk-vote"]['meeting'][choiceOfMeetingDate]['vote']
		
		var motionNameChi = [];
		votes.forEach(function(d){motionNameChi.push(d["motion-ch"]);})
		d3.select("#motions").selectAll("option")
			.data(motionNameChi).enter()
			.append("option").attr("value", function(d, i){
				return i; //index of vote on that meeting
			})
			.html(function(d){return d;});

		var choiceOfMotion_index;

		function printInfo(choiceOfMotion){
			//console.log(choiceOfMotion);

			d3.select(".motionInfo").select(".motion-ch").html("Motion Name (Chinese): " + choiceOfMotion["motion-ch"]);
			d3.select(".motionInfo").select(".motion-en").html("Motion Name (English): " + choiceOfMotion["motion-en"]);
			d3.select(".motionInfo").select(".vote-date").html("Date-Time of Vote: " + choiceOfMotion["vote-date"] + " - " + choiceOfMotion["vote-time"] );
			d3.select(".motionInfo").select(".vote-result").html("Result: "+choiceOfMotion["vote-summary"]["overall"]["result"]);
			d3.select(".motionInfo").select(".mover").html("Motion mover: " + choiceOfMotion["mover-en"] + ", " + choiceOfMotion["mover-ch"]);
			var sepFlag = choiceOfMotion["vote-separate-mechanism"];
			d3.select(".motionInfo").select(".voteSepMech").html("Vote Separate Mechanism: " + sepFlag);
			var temp1 = choiceOfMotion["vote-summary"]["geographical-constituency"];
			var temp2 = choiceOfMotion["vote-summary"]["functional-constituency"];
			if (sepFlag === "Yes"){
				d3.select(".motionInfo").select(".geo-con").html("Geographical Constituency Vote: " + "Abstain: "+ temp1["abstain-count"] + " | Vote Count: " + temp1["vote-count"] + 
															" | Yes: " + temp1["yes-count"] + " | No: " + temp1["no-count"] + " | Vote Count: " +temp1["vote-count"]+ " | Present Count: " + temp1["present-count"])
															.style("visibility", "visible");
				d3.select(".motionInfo").select(".func-con").html("Functional Constituency Vote: " + "Abstain: "+ temp2["abstain-count"] + " | Vote Count: " + temp2["vote-count"] + 
															" | Yes: " + temp2["yes-count"] + " | No: " + temp2["no-count"] + " | Vote Count: " +temp2["vote-count"]+ " | Present Count: " + temp2["present-count"])
															.style("visibility", "visible");
				d3.select(".motionInfo").select(".all-con").html("");

				d3.select(".detail").style("visibility", "visible");
			} else{
				var temp = choiceOfMotion["vote-summary"]["overall"];
				d3.select(".motionInfo").select(".all-con").html("Vote: " + "Abstain: "+ temp["abstain-count"] + " | Vote Count: " + temp["vote-count"] + 
															" | Yes: " + temp["yes-count"] + " | No: " + temp["no-count"] + " | Vote Count: " +temp["vote-count"]+ " | Present Count: " + temp["present-count"])
															.style("visibility", "visible");
				d3.select(".motionInfo").select(".geo-con").html("");
				d3.select(".motionInfo").select(".func-con").html("");

				d3.select(".detail").style("visibility", "hidden");
			}
		}

		function printAbsentMember(choiceOfMotion){
			console.log(choiceOfMotion);
			var members =choiceOfMotion["individual-votes"]["member"];
			var absents = [];
			members.forEach(function(d){
				if (d["vote"][0] === "Absent"){
					absents.push(d);
				}
			});
			console.log("Absent members");
			console.log(absents);
			var tempString = "";
			absents.forEach(function(d){
				tempString += d["_name-en"] + ", " + d["_name-ch"] + "&#9;";
			})
			d3.select(".motionInfo").select(".absentMember").html("Absent Member: " + tempString)
															.style("visibility", "visible");
		}

		//calculate votes by camp and consitituency
		
		function calGeoConVote(choiceOfMotion, con){
			var members =choiceOfMotion["individual-votes"]["member"];

			var demoMembers = [];
			members.forEach(function(d, i){
				if (d["_constituency"] === con && demoMemberList.includes(d["_name-en"])){
					demoMembers.push(d);
				}
			});
			console.log("demo members in "+con+"-constituency");
			console.log(demoMembers);
			var voteTemp;
			var demoYes = demoNo = demoAbsent = demoPresent = demoAbstain = 0;

			demoMembers.forEach(function(d, i){
				voteTemp = d["vote"][0];
				if (voteTemp === "Yes"){demoYes ++;}
				else if (voteTemp === "Absent"){demoAbsent++;}
				else if (voteTemp === "Present"){demoPresent++;}
				else if (voteTemp === "Abstain"){demoAbstain++;}
				else if (voteTemp === "No"){demoNo++;}
				else {console.log("vote count error!")}
			});
			
			d3.select(".details").select(".yes").html(demoYes);
			d3.select(".details").select(".no").html(demoNo);
			d3.select(".details").select(".abstain").html(demoAbstain);
			d3.select(".details").select(".absent").html(demoAbsent);
			d3.select(".details").select(".present").html(demoPresent);
			
			//establiment camp in geographical constituency
			var esMembers = [];
			members.forEach(function(d, i){
				if (d["_constituency"] === con && estabMemberList.includes(d["_name-en"])){
					esMembers.push(d);
				}
			});
			console.log("establiment members in "+con+"-constituency");
			console.log(esMembers);
			
			var esYes = esNo = esAbsent = esPresent = esAbstain = 0;

			esMembers.forEach(function(d, i){
				voteTemp = d["vote"][0];
				if (voteTemp === "Yes"){esYes ++;}
				else if (voteTemp === "Absent"){esAbsent++;}
				else if (voteTemp === "Present"){esPresent++;}
				else if (voteTemp === "Abstain"){esAbstain++;}
				else if (voteTemp === "No"){esNo++;}
				else {console.log("vote count error!")}
			});
			
			d3.select(".details").select(".es-yes").html(esYes);
			d3.select(".details").select(".es-no").html(esNo);
			d3.select(".details").select(".es-abstain").html(esAbstain);
			d3.select(".details").select(".es-absent").html(esAbsent);
			d3.select(".details").select(".es-present").html(esPresent);
		}

		function calFuncConVote(choiceOfMotion, con){
			var members =choiceOfMotion["individual-votes"]["member"];

			var demoMembers = [];
			members.forEach(function(d, i){
				if (d["_constituency"] === con && demoMemberList.includes(d["_name-en"])){
					demoMembers.push(d);
				}
			});
			console.log("demo members in "+con+"-constituency");
			console.log(demoMembers);
			var voteTemp;
			var demoYes = demoNo = demoAbsent = demoPresent = demoAbstain = 0;

			demoMembers.forEach(function(d, i){
				voteTemp = d["vote"][0];
				if (voteTemp === "Yes"){demoYes ++;}
				else if (voteTemp === "Absent"){demoAbsent++;}
				else if (voteTemp === "Present"){demoPresent++;}
				else if (voteTemp === "Abstain"){demoAbstain++;}
				else if (voteTemp === "No"){demoNo++;}
				else {console.log("vote count error!")}
			});
			
			d3.select(".details").select(".demo-yes-func").html(demoYes);
			d3.select(".details").select(".demo-no-func").html(demoNo);
			d3.select(".details").select(".demo-abstain-func").html(demoAbstain);
			d3.select(".details").select(".demo-absent-func").html(demoAbsent);
			d3.select(".details").select(".demo-present-func").html(demoPresent);
			
			//establiment camp in geographical constituency
			var esMembers = [];
			members.forEach(function(d, i){
				if (d["_constituency"] === con && estabMemberList.includes(d["_name-en"])){
					esMembers.push(d);
				}
			});
			console.log("establiment members in "+con+"-constituency");
			console.log(esMembers);
			
			var esYes = esNo = esAbsent = esPresent = esAbstain = 0;

			esMembers.forEach(function(d, i){
				voteTemp = d["vote"][0];
				if (voteTemp === "Yes"){esYes ++;}
				else if (voteTemp === "Absent"){esAbsent++;}
				else if (voteTemp === "Present"){esPresent++;}
				else if (voteTemp === "Abstain"){esAbstain++;}
				else if (voteTemp === "No"){esNo++;}
				else {console.log("vote count error!")}
			});
			
			d3.select(".details").select(".es-yes-func").html(esYes);
			d3.select(".details").select(".es-no-func").html(esNo);
			d3.select(".details").select(".es-abstain-func").html(esAbstain);
			d3.select(".details").select(".es-absent-func").html(esAbsent);
			d3.select(".details").select(".es-present-func").html(esPresent);
		}

		//if there only one vote on the chosen date
		if (data["legcohk-vote"]['meeting'][choiceOfMeetingDate]['vote'].length === 1) {
			choiceOfMotion = data["legcohk-vote"]['meeting'][choiceOfMeetingDate]['vote'][0];
			printInfo(choiceOfMotion);
			printAbsentMember(choiceOfMotion);
		}
		//else select motion
		d3.select("#motions").on("change", function(){
			choiceOfMotion_index = d3.select(this).property('value');
			choiceOfMotion = data["legcohk-vote"]['meeting'][choiceOfMeetingDate]['vote'][choiceOfMotion_index];
			printInfo(choiceOfMotion);
			printAbsentMember(choiceOfMotion);
			calGeoConVote(choiceOfMotion, "Geographical");
			calFuncConVote(choiceOfMotion, "Functional");
		});


	});	
}