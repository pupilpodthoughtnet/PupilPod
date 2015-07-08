/**
*	This service belongs to Mobile Development
*	author Virat Joshi
**/

app.controller('PPODController',function($scope,PPODService,$window,$rootScope,$cordovaPush,sharedProperties,myCache,$ionicPlatform,$ionicSideMenuDelegate,$state,$timeout,$cordovaDialogs,$cordovaSQLite){
	$scope.contactname = "ThoughtNet Technologies (India) Pvt. Ltd";
	$scope.loginTrue = sharedProperties.getIsLogin();
	
	$scope.student_name = sharedProperties.getStudentSelectedName();
	
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	
	$scope.students = {};
	$scope.student = "";
	
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};
	
	function initialize() {
		$scope.db = null;
        bindEvents();
    };
	
	var androidConfig = {
		"senderID": "74320630987",
	};
	
	function bindEvents() {
		$ionicPlatform.ready(function(){
			if(sharedProperties.getIsLogin() == false){
				$state.go('eventmenu.mainLanding');
			}
			else{
				onDeviceReady();
			}
		});
    };
	
	function onDeviceReady() {
		PPODService.dbConnection($scope,sharedProperties);
    };
	
	$scope.swapeOn = function(){
		$scope.ngViewClass = "modalOn";
	};
	
	$scope.swapeOff = function(){
		$scope.ngViewClass = "modalOff";
	};
		
	$rootScope.$on('loginStatus',function(event,args){
		if(!args.status){
			$scope.loginTrue = false;
			$scope.students = myCache.get('students');
			$scope.student_name = sharedProperties.getStudentSelectedName();
			$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+myCache.get('studentImage');
		}
		else{
			$scope.loginTrue = true;
		}
	});
	
	$rootScope.$on('modelOffEvent',function(event){
		$scope.ngViewClass = "modalOff";
	});
	
	
	$rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
      switch(notification.event) {
        case 'registered':
          if (notification.regid.length > 0 ) {
			PPODService.AddValueToDB($scope,'reg_id',notification.regid);
			//PPODService.sendRegKeyToServer($scope,'reg_id',notification.regid);
			$state.go('eventmenu.login');
          }
          break;

        case 'message':
          // this is the actual push notification. its format depends on the data model from the push server
			var msgObj = notification.message;
			var objJSON = eval("(function(){return " + msgObj + ";})()");
			//PPODService.AddNotificationToDB($scope,notification);
			$cordovaDialogs.alert(notification.message, "Push Notification Received");
			alert('NG '+objJSON.notify_guid);
			alert('ND '+objJSON.notify_date);
			alert('NT '+objJSON.notify_type);
			alert('NM '+objJSON.notify_msg);
			alert('EG '+objJSON.entity_guid);
			alert('message = ' + objJSON.message + ' msgCount = ' + objJSON.notify_guid);
			break;

        case 'error':
          //alert('GCM error = ' + notification.msg);
		  $cordovaDialogs.alert(notification.msg, "Error")
          break;

        default:
			$cordovaDialogs.alert("An unknown GCM event has occurred", "Event")
			//alert('An unknown GCM event has occurred');
			break;
      }
    });
	
	
	$rootScope.$on('studentChanged',function(event,args){
		$scope.student_name = args['name'];
		$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+myCache.get('studentImage');
		$state.go('eventmenu.change_student');
			return false;
	});
	
	$rootScope.$on('studentImageChange',function(event,args){
		$scope.student_name = sharedProperties.getStudentSelectedName();
		$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+myCache.get('studentImage');
		return false;
	});
	
	$scope.onReload = function() {
      console.warn('reload');
      var deferred = $q.defer();
      setTimeout(function() {
        deferred.resolve(true);
      }, 1000);
      return deferred.promise;
    };
	
	$scope.goTo = function(url){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$state.go('eventmenu.change_student');
	}
	
	initialize();
});

app.run(function($rootScope) {
	angular.element(document).on("click", function(e) {
		$rootScope.$broadcast("documentClicked", angular.element(e.target));
	});	
});

app.directive("dropdown", function($rootScope,sharedProperties) {
	return {
		restrict: "E",
		templateUrl: "app/directives/templates/dropdown.html",
		transclude: true,
		scope: {
			placeholder: "@",
			list: "=",
			selected: "=",
			property: "@"
		},
		link: function(scope) {
			scope.listVisible = false;
			scope.isPlaceholder = true;

			scope.select = function(item) {
				scope.isPlaceholder = false;
				scope.selected = item;
				scope.listVisible = false;
			};

			scope.isSelected = function(item) {
				return item[scope.property] === scope.selected[scope.property];
			};

			scope.show = function() {
				scope.listVisible = true;
			};

			$rootScope.$on("documentClicked", function(inner, target) {

			});

			scope.$watch("selected", function(value) {
				scope.isPlaceholder = scope.selected[scope.property] === undefined;
				scope.display = scope.selected[scope.property];
				sharedProperties.setStudentSelectedGuid(scope.selected['student_guid']);
				sharedProperties.setStudentSelectedName(scope.selected['name']);
				scope.$emit('studentChanged',{'name':scope.selected['name'],'student_guid':scope.selected['student_guid']});
			});
		}
	}
});

app.controller('loginController',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$q,$state,$ionicSideMenuDelegate,$timeout){
	$scope.loading = true;
	$scope.$on('$ionicView.enter', function(){
		$scope.loading = true;
		$ionicSideMenuDelegate.canDragContent(false);
		$scope.fnInit();
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
    });
	$scope.login = {
		instName: "",
		userName: "",
		password: "",
		registration_key: "",
		app_id: "",
		user_guid: ""
	};
	$scope.instDis = true;
	
	$scope.fnInit = function(){
		if(sharedProperties.getIsLogin() == false){
			$state.go('eventmenu.mainLanding');
			return false;
		}
		else{
			$scope.loading = true;		
			var regkey = sharedProperties.getRegKey();
			var usernameTemp = sharedProperties.getUserName();
			var passwordTemp = sharedProperties.getPassWord();
			var instnameTemp = sharedProperties.getInstName();
			var appId = sharedProperties.getAppId();
			var userGuid = sharedProperties.getUserGuid();
			if(instnameTemp != '' && usernameTemp != '' && passwordTemp != ''){
				$scope.login.instName = instnameTemp;
				$scope.login.userName = usernameTemp;
				$scope.login.password = passwordTemp;
				$scope.login.registration_key = regkey;
				$scope.login.app_id = appId;
				$scope.login.user_guid = userGuid;
				PPODService.loginFunction($scope,sharedProperties);
			}
			else{
				$scope.loading = false;
			}
		}
    }
	$scope.submit = function(form) {
		$scope.loading = true;
		$scope.submitted = true;
		$scope.login.registration_key = sharedProperties.getRegKey();
		$scope.login.app_id = sharedProperties.getAppId();
		$scope.login.user_guid = sharedProperties.getUserGuid();
		if($scope.login.instName == "" || $scope.login.instName == null){
			$scope.loading = false;
			alert('Please enter Instance Name, Instance Name field can not be empty');
			return false;
		}
		else if($scope.login.userName == "" || $scope.login.userName == null){
			$scope.loading = false;
			alert('Please enter User Name, User Name/id field can not be empty');
			return false;
		}
		else if($scope.login.password == "" || $scope.login.password == null){
			$scope.loading = false;
			alert('Please enter password, password field can not be empty');
			return false;
		}
		PPODService.loginFunction($scope,sharedProperties);	  
	};
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});


app.controller('homeController',function($scope,PPODService,$ionicSideMenuDelegate,$timeout){
	$scope.$on('$ionicView.enter', function(){
		$ionicSideMenuDelegate.canDragContent(false);
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
    });
	$scope.doRefresh = function() {
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('changeStudent',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$state,$ionicSideMenuDelegate,$timeout){
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$ionicSideMenuDelegate.canDragContent(false);
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
    });
	$scope.fnInit = function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		if(sharedProperties.getIsLogin() == false){
			$state.go('eventmenu.mainLanding');
		}
    };
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('mainController',function($scope,PPODService,$http,$window,$document,sharedProperties,myCache,$ionicSideMenuDelegate,$timeout,$state){
	$scope.loading = true;
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		var param = {"status": false};
		if(sharedProperties.getIsLogin() == false){
			$scope.$emit('loginStatus', param);
		}
		$scope.loading = true;
		$scope.fnInit();
		
	});
	$scope.$on('$ionicView.leave', function(){
    });
	
	$scope.fnInit = function(){
		//var main_students_guid = myCache.get('main_students_guid');		
		var cache = myCache.get('studentName');
		if(cache){
			if(sharedProperties.getIsLogin() == false){
				if(myCache.get('main_students_guid') != sharedProperties.getStudentSelectedGuid())
				{
					PPODService.getStudentDetails($scope,sharedProperties);
				}
				else{
					$scope.loading = false;
					$scope.messageDashboard = myCache.get('messageDashboard');
					if($scope.messageDashboard == null || $scope.messageDashboard.length == 0)
						$scope.messageDisplay = false;
					else
						$scope.messageDisplay = true;
					$scope.programDashboard = myCache.get('programDashboard');
					$scope.cal_of_eventDashboard = myCache.get('cal_of_eventDashboard');
					if($scope.cal_of_eventDashboard == null || $scope.cal_of_eventDashboard.length == 0)
						$scope.calenderDisplay = false;
					else
						$scope.calenderDisplay = true;
					$scope.attendanceDashboard = myCache.get('attendanceDashboard');
					$scope.feesDashboard = myCache.get('feesDashboard');
					$scope.studentDetails = myCache.get('studentDetails');
				}
			}
			else{
				//$scope.loading = false;
				$state.go('eventmenu.login');
			}
		}
		else{
			if(sharedProperties.getIsLogin() == false){
				PPODService.getStudentDetails($scope,sharedProperties);
			}
			else{
				//$scope.loading = false;
				$state.go('eventmenu.login');
			}
		}
    };

    $scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('gettingAllTests',function($scope,PPODService,$http,$window,$document,sharedProperties,$ionicSideMenuDelegate,$timeout,$state){
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		if(sharedProperties.getIsLogin() == false){
			PPODService.getStudentTestDetails($scope,sharedProperties);
		}
    }
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
	$scope.goToDetails = function(tig){
		var path = "eventmenu.view_test_details";
		var param = {test_ins_guid: tig};
		$state.go(path,param);
	};
});

app.controller('TestDetailsForStudent',function($scope,PPODService,$http,$window,$document,sharedProperties,$stateParams,$ionicSideMenuDelegate,$timeout){
	
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.fnInit();
	});
	$scope.fnInit = function(){
		if(sharedProperties.getIsLogin() == false){
			$scope.test_ins_guid = $stateParams.test_ins_guid;
			PPODService.getStudentTestMarks($scope,sharedProperties);
		}
    }
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('feesController',function($scope,PPODService,$http,$window,$document,sharedProperties,$state,$ionicSideMenuDelegate,$timeout){
	
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.fnInit();
	});
	var ref = "";
	$scope.fnInit = function(){
		$scope.$emit('modelOffEvent', true);	
    }
	$scope.makePayment = function(payment_id){
		ref = $window.open('http://thoughtnet.pupilpod.in/paymenttest.php', '_blank', 'location=no');
        ref.addEventListener('loadstart', function(event) {  });
        ref.addEventListener('loadstop', function(event) {  
			if (event.url.match("/close")) {
				ref.close();
			}
		});
        ref.addEventListener('loaderror', function(event) {
			if (event.url.match("/close")) {
				ref.close();
			} 
		});
		ref.addEventListener('exit', function(event) { $state.go('eventmenu.paymentCallBack'); });
	}
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('logoutController',function($scope,PPODService,sharedProperties,$ionicSideMenuDelegate,$ionicHistory,$ionicPopup){
	$scope.$on('$ionicView.enter', function(){
		$ionicSideMenuDelegate.canDragContent(false);
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.spinning = true;
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
		$scope.spinning = false;
    });
	$scope.fnInit = function(){
		$scope.showConfirm();
    }
	$scope.showConfirm = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Logout',
			template: 'Are you sure you want to logout?',
			okText: 'Logout', // String (default: 'OK'). The text of the OK button.
			okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
		});
		confirmPopup.then(function(res) {
			if(res) {
				var param = {"status": true};
				$scope.$emit('loginStatus', param);
				PPODService.removeLocalEntry($scope,sharedProperties);
			} else {
				console.log('Inside else part');
				if($ionicSideMenuDelegate.isOpenLeft()){
					$ionicSideMenuDelegate.toggleLeft();
				}
				$ionicHistory.goBack();
				return false;
			}
		});
	};
});

app.controller('studentViewController',function($scope,PPODService,sharedProperties,$ionicSideMenuDelegate,$ionicHistory,$ionicPopup){
	$scope.loading = false;
	$scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.spinning = true;
		$scope.fnInit();
	});
	$scope.$on('$ionicView.leave', function(){
		
    });
	$scope.fnInit = function(){	
		$scope.loading = false;
		$scope.studentName = myCache.get('studentName');
		$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+myCache.get('studentImage');
		$scope.studentDetails = myCache.get('studentDetails');
    };
	$scope.doRefresh = function() {
		console.log('Refreshing!');
		$timeout( function() {
		  $scope.$broadcast('scroll.refreshComplete');
		}, 1000);
    };
});

app.controller('FeedbackController',function($scope,PPODService,$http,$window,$document,sharedProperties){
	
	$scope.FeedbackFormsubmit = function(test) {
		PPODService.sendFeedBack($scope,sharedProperties);
		return false;
	};
    
});

app.controller('AttendanceController',function($scope,PPODService,$http,$window,$document,sharedProperties){
    var ref = "";
    montharr=['January', 'February', 'March', 'April','May','June','July','August','September','October','November','December'];
    var date = new Date();
    var currentdate= date.getDate();
    var  currentmonth= date.getMonth();
    var currentyear= date.getFullYear();
	$scope.loading = true;
    $scope.monthyear=(montharr[currentmonth]+ ' '+currentyear);
    $scope.month=currentmonth;
    $scope.year=currentyear;
    defaultmonth=currentmonth;
    defaultyear=currentyear;
    PPODService.getAttendance($scope,sharedProperties);
    
    $scope.prev = function(){
		if(currentmonth==0)
		{
			currentmonth=11;
			currentyear=currentyear-1;
		}
		else
		{
			currentmonth=currentmonth-1;
		}
		$scope.loading = true;
		$scope.monthyear=(montharr[currentmonth]+ ' '+currentyear);
		$scope.currentmonth=currentmonth;
		$scope.currentyear=currentyear;
		$scope.month=currentmonth;
		$scope.year=currentyear;
		PPODService.getAttendance($scope,sharedProperties);
    };

    $scope.next = function(){
		if(new Date(currentyear,currentmonth,1)< new Date(defaultyear,defaultmonth,1))
		{
			if(currentmonth==11)
			{
				currentmonth=0;
				currentyear=currentyear+1;
			}
			else
			{
				currentmonth=currentmonth+1;
			}			 
		}         
		$scope.loading = true;
		$scope.monthyear=(montharr[currentmonth]+ ' '+currentyear);
		$scope.currentmonth=currentmonth;
		$scope.currentyear=currentyear;
		$scope.month=currentmonth;
		$scope.year=currentyear;
		PPODService.getAttendance($scope,sharedProperties);
    }
});

app.controller('transportDetails',function($scope,PPODService,$http,sharedProperties,$ionicSideMenuDelegate){
		$ionicSideMenuDelegate.canDragContent(false);
		$scope.spinning = true;
		$scope.$on('$ionicView.enter', function(){
			$scope.fnInit();
		});
	$scope.fnInit=function fnInit(){
		PPODService.getStudentTransportDetails($scope,sharedProperties);
	}
});

app.controller('CalenderController',function($scope,PPODService,$http,$window,$document,sharedProperties,$ionicSideMenuDelegate,$timeout,$location){
	var ref = "";
    montharr=['January', 'February', 'March', 'April','May','June','July','August','September','October','November','December'];
	if(sharedProperties.getMonth() =='' && sharedProperties.getYear() ==''){
		var date = new Date();
		var currentdate= date.getDate();
		var currentmonth= date.getMonth();
		var currentyear= date.getFullYear();
	}
    else{
        var  currentmonth= sharedProperties.getMonth();
		var currentyear= sharedProperties.getYear();
	}
    $scope.monthyear=(montharr[currentmonth]+ ' '+currentyear);
    $scope.month=currentmonth;
    $scope.year=currentyear;
    defaultmonth=currentmonth;
    defaultyear=currentyear;
    PPODService.getCalenderEvents($scope,sharedProperties);
    $scope.prev = function(){
		if(currentmonth==0)
		{
			currentmonth=11;
			currentyear=currentyear-1;
		}
		else
		{
			currentmonth=currentmonth-1;
		}
		$scope.monthyear=(montharr[currentmonth]+ ' '+currentyear);
		$scope.currentmonth=currentmonth;
		$scope.currentyear=currentyear;
		$scope.month=currentmonth;
		$scope.year=currentyear;
		PPODService.getCalenderEvents($scope,sharedProperties);
	};

	$scope.next = function(){
        if(currentmonth==11)
        {
			currentmonth=0;
			currentyear=currentyear+1;
        }
        else
        {
			currentmonth=currentmonth+1;
        }
		$scope.monthyear=(montharr[currentmonth]+ ' '+currentyear);
		$scope.currentmonth=currentmonth;
		$scope.currentyear=currentyear;
		$scope.month=currentmonth;
		$scope.year=currentyear;
		PPODService.getCalenderEvents($scope,sharedProperties);
    }
    $scope.fnViewDetails = function(row){
        sharedProperties.setMonth($scope.month);
        sharedProperties.setYear($scope.year);
        sharedProperties.setEventRow(row);
		var path = "/eventmenu/event_details";
        $location.path(path);
    }
}); 

app.controller('EventDetailController',function($scope,PPODService,sharedProperties){
    fnInit();
    function fnInit(){
        $scope.event=sharedProperties.getEventRow();
    }
});

app.controller('PublicationController',function($scope,$window,PPODService,sharedProperties,$location){
    $scope.fnInit = function(){
        $scope.loading = true;
        var promise = PPODService.getPublications();
        promise.then(function(result) {
            $scope.loading = false;
            $scope.publications = result;

        }, function(reason) {
            $scope.loading = false;
            alert(reason);
        });
    }
    $scope.fnViewDetails = function(row){
        sharedProperties.setPublicationRow(row);
        $location.path("/eventmenu/publication_details");
    }
});
app.controller('PublicationDetailController',function($scope,PPODService,sharedProperties){
    fnInit();
    function fnInit(){
        var promise = PPODService.getPublicationDetails(sharedProperties.getPublicationRow());
        promise.then(function(result) {
            $scope.loading = false;
            $scope.publication_details = result.publication_details;
            $scope.publication_attachments = result.publication_attachments;
        }, function(reason) {
            $scope.loading = false;
            alert(reason);
        });
    }
});
app.controller('NotificationController',function($scope,PPODService,sharedProperties){
    $scope.$on('$ionicView.enter', function(){
		if($ionicSideMenuDelegate.isOpenLeft()){
			$ionicSideMenuDelegate.toggleLeft();
		}
		$scope.spinning = true;
		$scope.fnInit();
	});
    $scope.fnInit = function(){
		$scope.allMessages = myCache.get('allMessages');
		if($scope.allMessages == null || $scope.allMessages.length == 0)
			$scope.messageDisplay = false;
		else
			$scope.messageDisplay = true;
    }
	$scope.fnViewDetails = function(item){
		var pubobj = new Object();
        pubobj['pG']  = item.entity_guid;
        pubobj['piG'] = item.notify_guid;
		sharedProperties.setPublicationRow(pubobj);
        $location.path("/eventmenu/publication_details");
	}
});