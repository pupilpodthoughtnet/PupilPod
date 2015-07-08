var app = angular.module('PPOD',['ionic','ngCordova']);

app.constant('url', 'NBA/amfphp-2.1/Amfphp/?contentType=application/json');

app.run(['$ionicPlatform','$timeout','$state','$window','$ionicHistory', 
	function($ionicPlatform,$timeout,$state,$window,$ionicHistory) {
		FastClick.attach(document.body);
		$ionicPlatform.on("resume", function(event) {
			//alert('Resume Event Occured');
		});
		$ionicPlatform.on("pause", function(event) {
			//alert('Resume Event Occured');
		});
		$ionicPlatform.registerBackButtonAction(function () {
			if($state.current.name=="eventmenu.login" || $state.current.name=="eventmenu.home" || $state.current.name=="eventmenu.mainLanding"){
				//navigator.app.exitApp();
				navigator.Backbutton.goHome(function() {
					console.log('success');
				}, function() {
					console.log('fail');
				});
			}
			if($state.current.name=="eventmenu.logout"){
				$ionicHistory.goBack(-2);
			}
			else {
				navigator.app.backHistory();
			}
		}, 100);
	}
]);

app.factory('myCache', function($cacheFactory) {
 return $cacheFactory('myData');
});

app.config(function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});

app.config(['$stateProvider', '$urlRouterProvider',function($stateProvider, $urlRouterProvider) {
	$stateProvider
	.state('eventmenu', {
		cache: false,
		url: "/eventmenu",
		abstract: true,
		templateUrl: 'app/views/others/sidebar.html'
    })
	.state('eventmenu.home', {
		cache: false,
		url: "/home",
		views: {
			'menuContent' :{
			  templateUrl: 'app/views/Home.html',
			  controller: "homeController"
			}
		}
    })
	.state('eventmenu.login', {
		cache: false,
		url: "/login",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/login.html',
				controller: "loginController"
			}
		}
    })
	.state('eventmenu.mainLanding', {
		cache: false,
		url: "/mainLanding",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/mainLanding.html',
				controller: "mainController"
			}
		}
    })
	.state('eventmenu.exam_details', {
		cache: false,
		url: "/exam_details",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/exam_details.html',
				controller: "gettingAllTests"
			}
		}
    })
	.state('eventmenu.fees', {
		cache: false,
		url: "/fees",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/fees.html',
				controller: "feesController"
			}
		}
    })
	.state('eventmenu.paymentCallBack', {
		cache: false,
		url: "/paymentCallBack",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/paymentCallBack.html',
				controller: ""
			}
		}
    })
	.state('eventmenu.view_test_details', {
		cache: false,
		url: "/view_test_details?test_ins_guid",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/view_test_details.html',
				controller: "TestDetailsForStudent"
			}
		}
    })
	.state('eventmenu.change_student', {
		url: "/change_student",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/change_student.html',
				controller: "changeStudent"
			}
		}
    })
	.state('eventmenu.logout', {
		url: "/logout",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/logout.html',
				controller: "logoutController"
			}
		}
    })
	.state('eventmenu.user_feedback', {
		cache: false,
		url: "/user_feedback",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/user_feedback.html',
				controller: ""
			}
		}
    })
	.state('eventmenu.attendance', {
		cache: false,
		url: "/attendance",
		views: {
			'menuContent' :{
			  templateUrl: 'app/views/others/attendance.html',
			  controller: "AttendanceController"
			}
		}
    })
	.state('eventmenu.transportDetails', {
		url: "/transportDetails",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/transportDetails.html',
				controller: "transportDetails"
			}
		}
	})
	.state('eventmenu.event_details', {
		cache: false,
		url: "/event_details",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/event_details.html',
				controller: "EventDetailController"
			}
		}
    })
	.state('eventmenu.calender', {
		cache: false,
		url: "/calender",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/calender.html',
				controller: "CalenderController"
			}
		}
    })
	.state('eventmenu.publications',{
        url: "/publications",
        views: {
            'menuContent' :{
                templateUrl: 'app/views/others/publication.html',
                controller:'PublicationController'
            }
        }
    })
    .state('eventmenu.publication_details',{
        url: "/publication_details",
        views: {
            'menuContent': {
                templateUrl: 'app/views/others/publication_details.html',
                controller: 'PublicationDetailController'
            }
        }
    })
	.state('eventmenu.student_view', {
		url: "/student_view",
		views: {
			'menuContent' :{
				templateUrl: 'app/views/others/student_view.html',
				controller: "studentViewController"
			}
		}
    });
	$urlRouterProvider.otherwise("/eventmenu/home");
}]);

app.service('sharedProperties', function () {
	var reg_key = '';
	var userName = '';
	var passWord = '';
	var instName = '';
	var parOrStu = '';
	var isLogin = true;
	var login_entity_guid = '';
	var app_id = '';
	var student_guid = '';
	var student_name = '';
	var test_instance_guid = '';
	var dbObj_com = null;
	var event = new Array();
	var month='';
	var year='';
	var _publicationRow='';
	return {
		getRegKey: function() {
			return reg_key;
		},
		setRegKey: function(regKey) {
			reg_key = regKey;
		},
		getUserName: function() {
			return userName;
		},
		setUserName: function(user) {
			userName = user;
		},
		getPassWord: function() {
			return passWord;
		},
		setPassWord: function(pass) {
			passWord = pass;
		},
		getInstName: function() {
			return instName;
		},
		setInstName: function(inst) {
			instName = inst;
		},
		getParOrStu: function() {
			return parOrStu;
		},
		setParOrStu: function(typeoflogin) {
			parOrStu = typeoflogin;
		},
		getUserGuid: function() {
			return login_entity_guid;
		},
		setUserGuid: function(entity_guid) {
			login_entity_guid = entity_guid;
		},
		getIsLogin: function() {
			return isLogin;
		},
		setIsLogin: function(login) {
			isLogin = login;
		},
		getAppId: function() {
			return app_id;
		},
		setAppId: function(appid) {
			app_id = appid;
		},
		getStudentSelectedGuid: function() {
			return student_guid;
		},
		setStudentSelectedGuid: function(stuGuid) {
			student_guid = stuGuid;
		},
		getStudentSelectedName: function() {
			return student_name;
		},
		setStudentSelectedName: function(stuName) {
			student_name = stuName;
		},
		getTestInstanceGuid: function(){
			return test_instance_guid;
		},
		setTestInstanceGuid: function(testInsGuid){
			test_instance_guid = testInsGuid;
		},
		getTestDBConObj: function(){
			return dbObj_com;
		},
		setTestDBConObj: function(dbObj){
			dbObj_com = dbObj;
		},
		getEventRow: function(){
			return event;
		},
		setEventRow: function(row){
			event = row;
		},
		getMonth: function(){
            return month;
        },
        setMonth: function(row){
            month = row;
        },
        getYear: function(){
            return year;
        },
        setYear: function(row){
            year = row;
        },
		setPublicationRow:function(_publicationRow){
            this._publicationRow = _publicationRow;
        },
        getPublicationRow:function(){
            return this._publicationRow;
        }
	};
});