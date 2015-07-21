/**
*	This service belongs to Mobile Development
*	author Virat Joshi
**/


app.service('PPODService',function($http,url,$window,$timeout,sharedProperties,$cordovaPush,$rootScope,$state,myCache,$ionicPopup,$cordovaSQLite,$q,$cordovaDialogs){    
	this.dbConnection = function($scope,sharedProperties){
		var shortName = 'tnet_pupilpod';
		var version = '1.0';
		var displayName = 'Tnet_Pupilpod';
		var maxSize = 65535;
		db = $window.openDatabase(shortName, version, displayName,maxSize);
		db.transaction(createTable,errorHandlerTransaction,successCallBack);
		$scope.db = db;
	};
	
	function createTable(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS tnet_login_details(Id INTEGER NOT NULL PRIMARY KEY, field_key TEXT NOT NULL, field_value TEXT NOT NULL)',[],nullHandler,errorHandlerQuery); 
		tx.executeSql('CREATE TABLE IF NOT EXISTS tnet_notification_details(Id INTEGER NOT NULL PRIMARY KEY, notify_guid TEXT NOT NULL, notify_date TEXT NOT NULL, notify_type TEXT NOT NULL, notify_msg TEXT NOT NULL, entity_guid TEXT NOT NULL)',[],nullHandler,errorHandlerQuery); 
		return false;
	};
	
    function successHandler(result) {
		return false;
    };
	
    function errorHandler(error) {
		$cordovaDialogs.alert("errorHandler Code : "+error.code+" Message "+error.message, "Error");
		return false;
    };
	
	function errorHandlerTransaction(error){
		$cordovaDialogs.alert("errorHandlerTransaction Code : "+error.code+" Message "+error.message, "Error");
		return false;
	};
	
	function errorHandlerQuery(error){
		$cordovaDialogs.alert("errorHandlerQuery Code : "+error.code+" Message "+error.message, "Error");
		return false;
	};
	
	function successInsert(){
		return false;
	};
	
	function nullHandler(){
		return false;
	};
	
	this.AddValueToDB = function($scope,field_key,field_value) { 
		if (!$window.openDatabase) {
			$cordovaDialogs.alert('Databases is not supported in this browser.', "Error");
			return;
		}
		if(field_key == 'reg_id')
			sharedProperties.setRegKey(field_value);
		if($scope.db == null || $scope.db == ''){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(createTable,errorHandlerTransaction,nullHandler);
			$scope.db = db;		
		}
		$scope.db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details WHERE field_key = ? ", [field_key],function(transaction, result)
			{
				if (result != null && result.rows != null) {
					if(result.rows.length == 0){
						transaction.executeSql('INSERT INTO tnet_login_details(field_key, field_value) VALUES (?,?)',[field_key, field_value],nullHandler,errorHandlerQuery);
					}
					else{
						transaction.executeSql('UPDATE tnet_login_details set field_value = ? WHERE field_key = ? ',[ field_value,field_key],nullHandler,errorHandlerQuery);
					}
				}
			},errorHandlerQuery);
		},errorHandlerTransaction,nullHandler);
		return false;
	};
	
	
	
	function successCallBack() { 
		db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details WHERE field_key = ? ", ['reg_id'],function(transaction, result)
			{
				var androidConfig = {
					"senderID": "730178859471",
				};
				if (result != null && result.rows != null) {
					if(result.rows.length == 0){
						$cordovaPush.register(androidConfig).then(function(resultPush) {
						}, function(err) {
							$cordovaDialogs.alert(err, "Error");
						});
						//$state.go('eventmenu.login');
					}
					else{
						transaction.executeSql("SELECT * FROM tnet_login_details", [],function(transaction, resultT1)
						{
							for (var i = 0; i < resultT1.rows.length; i++) {
								var row = resultT1.rows.item(i);
								if(row.field_key == 'reg_id'){
									sharedProperties.setRegKey(row.field_value);
								}
								else if(row.field_key == 'username'){
									sharedProperties.setUserName(row.field_value);
								}
								else if(row.field_key == 'password'){
									sharedProperties.setPassWord(row.field_value);
								}
								else if(row.field_key == 'instname'){
									sharedProperties.setInstName(row.field_value);
								}
								else if(row.field_key == 'appid'){
									sharedProperties.setAppId(row.field_value);
								}
								else if(row.field_key == 'userguid'){
									sharedProperties.setUserGuid(row.field_value);
								}
							}
						},errorHandlerQuery);
						var tempData = new Array();
						var tempData1 = new Array();
						transaction.executeSql("SELECT * FROM tnet_notification_details", [],function(transaction, resultT2)
						{
							for (var i = 0; i < resultT2.rows.length; i++) {
								var row = resultT2.rows.item(i);
								/* if(i < 2){
									tempData.push(row);
								} */
								if(((resultT2.rows.length) - i) < 4){
									tempData.push(row);
								}
								tempData1.push(row);
							}
						},errorHandlerQuery); 
						myCache.put('messageDashboard',tempData);
						myCache.put('allMessages',tempData1);
						$cordovaPush.register(androidConfig).then(function(resultPush) {
						}, function(err) {
							$cordovaDialogs.alert(err, "Error");
						});
						//$state.go('eventmenu.login');
					}
				}
				else{
					$cordovaPush.register(androidConfig).then(function(resultPush) {
					}, function(err) {
						$cordovaDialogs.alert(err, "Error");
					})
				}
				return false;
			},errorHandlerQuery);
			
			
		},errorHandlerTransaction,nullHandler);
		return false;
	};
	
	this.loginFunction = function ($scope,sharedProperties){
		var self = this;
		var param = JSON.stringify({
                "serviceName":"TnetMobileService", 
                "methodName":"login",
                "parameters":[null,{'instName' : $scope.login.instName,'userName' : $scope.login.userName,'password': $scope.login.password,'registration_key' : $scope.login.registration_key,'app_id' : $scope.login.app_id,'user_guid' : $scope.login.user_guid}]
                });
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		var tempUrl = "http://"+$scope.login.instName+"/"+url;
		$http.post(tempUrl, param).success(function(data, status, headers, config) {		
			if(data.valid == 'VALID'){
				sharedProperties.setIsLogin(false);
				sharedProperties.setInstName(data.instName);
				sharedProperties.setUserName(data.userName);
				sharedProperties.setPassWord(data.password);
				sharedProperties.setAppId(data.app_id);
				sharedProperties.setUserGuid(data.user_guid);
				sharedProperties.setStudentSelectedGuid(data.studentDetails[0]['student_guid']);
				sharedProperties.setStudentSelectedName(data.studentDetails[0]['name']);
				$scope.login = true;
				$scope.students = data.studentDetails;
				$scope.menuList = data.menuList;
				$scope.DeshBoardmenuList = data.DeshBoardmenuList;
				myCache.put('students', data.studentDetails);
				myCache.put('main_students_guid', data.studentDetails[0]['student_guid']);
				myCache.put('menuList', data.menuList);
				myCache.put('DeshBoardmenuList', data.DeshBoardmenuList);
				
				
				self.AddValueToDB($scope,'username',data.userName);
				self.AddValueToDB($scope,'password',data.password);
				self.AddValueToDB($scope,'instname',data.instName);
				self.AddValueToDB($scope,'appid',data.app_id);
				self.AddValueToDB($scope,'userguid',data.user_guid);
				$state.go('eventmenu.mainLanding');
				
			}
			else{
				$scope.instDis = false;
				$scope.loading = false;
				if(data.user_guid == 'NOT_ENABLED'){
					$cordovaDialogs.alert(data.reason, "Alert");
				}
				else{
					$cordovaDialogs.alert(data.reason, "Error");
				}
			}
		})
		.error(function(data, status, headers, config){
			//$state.go('eventmenu.login');
			$scope.loading = false;
			$cordovaDialogs.alert('Something went wrong please try again', "Error");
			return false;
		});
    };
	
	this.getStudentDetails = function($scope,sharedProperties){
		var param = JSON.stringify({
                "serviceName":"TnetMobileService", 
                "methodName":"getStudentDetails",
                "parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid()}]
                });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {	
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.studentName = data.name;
				$scope.studentImage = "http://"+sharedProperties.getInstName()+"/"+data.photo;
				$scope.studentDetails = data.all_other;
				$scope.programDashboard = data.program_details;
				$scope.messageDashboard = myCache.get('messageDashboard');
				if($scope.messageDashboard == null || $scope.messageDashboard.length == 0)
					$scope.messageDisplay = false;
				else
					$scope.messageDisplay = true;
				$scope.cal_of_eventDashboard = data.coe_details;
				if($scope.cal_of_eventDashboard == null || $scope.cal_of_eventDashboard.length == 0)
					$scope.calenderDisplay = false;
				else
					$scope.calenderDisplay = true;
				$scope.attendanceDashboard = data.attendance_details;
				$scope.feesDashboard = data.fees_details;
				$scope.menuList = myCache.get('menuList');
				myCache.put('studentDetails', data.all_other);
				myCache.put('studentName', data.name);
				myCache.put('studentImage', data.photo);
				myCache.put('main_students_guid', sharedProperties.getStudentSelectedGuid());
				myCache.put('programDashboard',data.program_details);
				myCache.put('cal_of_eventDashboard',data.coe_details);
				myCache.put('attendanceDashboard',data.attendance_details);
				myCache.put('feesDashboard',data.fees_details);
				var param = {"studentImage": $scope.studentImage};
				$scope.$emit('studentImageChange', param);
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert('Something went wrong please try again', "Error");
			return false;
		});
	};

	this.getStudentTestDetails = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getStudentTestDetails",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid()}]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.studentTestDetails = data.all_tests;
				$scope.termName = data.term_name;
				$scope.sectionName = data.section_name;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert('Something went wrong please try again', "Error");
			return false;
		});
	};
	
	this.getStudentTestMarks = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getStudentTestMarks",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid(),'test_ins_guid': $scope.test_ins_guid }]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.studentTestMarks = data.test_details;
				$scope.testName = data.test_name;
				$scope.testCode = data.test_code;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert('Something went wrong please try again', "Error");
			return false;
		});
	};
	
	this.removeLocalEntry = function($scope,sharedProperties){
		if (!$window.openDatabase) {
			$cordovaDialogs.alert('Databases are not supported in this browser.', "Error");
			return;
		}
		if($scope.db == null || $scope.db == ''){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(createTable,errorHandlerTransaction,nullHandler);
			$scope.db = db;		
		}
		$scope.db.transaction(function(transaction) {
			transaction.executeSql("SELECT * FROM tnet_login_details", [],function(transaction, resultT1)
			{
				for (var i = 0; i < resultT1.rows.length; i++) {
					var row = resultT1.rows.item(i);
					if(row.field_key == 'reg_id'){
					}
					else if(row.field_key == 'username'){
						transaction.executeSql('DELETE FROM tnet_login_details WHERE field_key = ? ',[row.field_key],nullHandler,errorHandlerQuery);
					}
					else if(row.field_key == 'password'){
						transaction.executeSql('DELETE FROM tnet_login_details WHERE field_key = ? ',[row.field_key],nullHandler,errorHandlerQuery);
					}
					else if(row.field_key == 'instname'){
						transaction.executeSql('DELETE FROM tnet_login_details WHERE field_key = ? ',[row.field_key],nullHandler,errorHandlerQuery);
					}
					else if(row.field_key == 'appid'){
					}
					else if(row.field_key == 'userguid'){
					}
				}
			},errorHandlerQuery);
		},errorHandlerTransaction,nullHandler);
		var tempArr = new Array();
		myCache.put('studentDetails', null);
		myCache.put('studentName', false);
		myCache.put('studentImage', null);
		myCache.put('main_students_guid', null);
		myCache.put('programDashboard',null);
		myCache.put('cal_of_eventDashboard',null);
		myCache.put('attendanceDashboard',null);
		myCache.put('feesDashboard',null);
		myCache.put('messageDashboard',null);
		myCache.put('allMessages',null);
		myCache.put('students', null);
		myCache.put('main_students_guid', null);
		sharedProperties.setInstName("");
		sharedProperties.setUserName("");
		sharedProperties.setPassWord("");
		sharedProperties.setIsLogin(true);
		sharedProperties.setStudentSelectedGuid("");
		sharedProperties.setStudentSelectedName("");
		$state.go('eventmenu.login');
	};
	
	this.showAlert = function(var_title,var_template) {
		var alertPopup = $ionicPopup.alert({
			title: var_title,
			template: var_template
		});
		alertPopup.then(function(res) {
			console.log('Thank you for not eating my delicious ice cream cone');
		});
	};
	
	this.sendRegKeyToServer = function($scope,key,regid){
		if(sharedProperties.getRegKey() == ''){
			self.AddValueToDB($scope,key,regid);
			if(sharedProperties.getAppId() != ""){
				var param = JSON.stringify({
					"serviceName":"TnetMobileService", 
					"methodName":"saveRegistrationKey",
					"parameters":[null,{'app_id' : sharedProperties.getAppId(),'notification_key': regid }]
				});
				var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
				$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
				$http.post(tempUrl, param).success(function(data, status, headers, config) {
					if(data.valid == 'VALID'){
						
					}
				})
				.error(function(data, status, headers, config){
					$scope.loading = false;
					$cordovaDialogs.alert('Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in', "Error");
					return false;
				});
			}
		}
		else if(sharedProperties.getRegKey() != regid){
			self.AddValueToDB($scope,key,regid);
			if(sharedProperties.getAppId() != ""){
				var param = JSON.stringify({
					"serviceName":"TnetMobileService", 
					"methodName":"saveRegistrationKey",
					"parameters":[null,{'app_id' : sharedProperties.getAppId(),'notification_key': regid }]
				});
				var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
				$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
				$http.post(tempUrl, param).success(function(data, status, headers, config) {
					if(data.valid == 'VALID'){
						
					}
				})
				.error(function(data, status, headers, config){
					$scope.loading = false;
					$cordovaDialogs.alert('Something went wrong please try again', "Error");
					return false;
				});
			}
		}
	};
	this.AddNotificationToDB = function($scope,notificationDetails){
		
		if($scope.db == null || $scope.db == ''){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(createTable,errorHandlerTransaction,nullHandler);
			$scope.db = db;		
		}
		$scope.db.transaction(function(transaction) {
			transaction.executeSql('INSERT INTO tnet_notification_details(notify_guid,notify_date,notify_type,notify_msg,entity_guid) VALUES (?,?,?,?,?)',[notificationDetails.notify_guid,notificationDetails.notify_date, notificationDetails.notify_type, notificationDetails.notify_msg,notificationDetails.entity_guid],nullHandler,errorHandlerQuery);		
		},errorHandlerTransaction,nullHandler);
	};
	
	this.sendFeedBack = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"sendFeedBack",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid(),	'category': $scope.category,'email': $scope.email,'message': $scope.message}]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		//var tempUrl = "http://hestage.pupilpod.in/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.emailsent = data.emailsent;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert('Something went wrong please try again', "Error");
			return false;
		});
	};
	
	this.getAttendance = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getAttendance",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid(),'month': $scope.month,'year': $scope.year}]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		//var tempUrl = "http://hestage.pupilpod.in/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.attendances = data.attendances;
				$scope.fail=data.fail;
				$scope.type=data.type;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert('Ohh Snap, Something went wrong!', "Error");
			return false;
		});
	};
	
	this.getStudentTransportDetails = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getStudentTransportDetails",
			"parameters":[null,{'student_guid': sharedProperties.getStudentSelectedGuid(),'user_guid':sharedProperties.getUserGuid()}]
		});
		
		//var tempUrl = "http://hestage.pupilpod.in"+"/"+url;
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
			
				$scope.loading = false;
				$scope.routeDetails = data.routeDetails;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert("Ohh Snap, Something went wrong!","Error");
			return false;
		});
	};
	
	this.getCalenderEvents = function($scope,sharedProperties){
		var param = JSON.stringify({
			"serviceName":"TnetMobileService", 
			"methodName":"getCalenderEvents",
			"parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid(),'month': $scope.month,'year': $scope.year}]
        });
		var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
		//var tempUrl = "http://hetest.pupilpod.in/"+url;
		$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
		$http.post(tempUrl, param).success(function(data, status, headers, config) {
			if(data.valid == 'VALID'){
				$scope.loading = false;
				$scope.events = data.events;
				$scope.fail=data.fail;
				$scope.type=data.type;
			}
			else{
				$scope.loading = false;
			}
		})
		.error(function(data, status, headers, config){
			$scope.loading = false;
			$cordovaDialogs.alert("Ohh Snap, Something went wrong!","Error");
			return false;
		});
	};
	this.getPublications = function(){
        var param = JSON.stringify({
            "serviceName":"TnetMobileService",
            "methodName":"getPublications",
            "parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid() }]
        });

        var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        var deferred = $q.defer();
        $http.post(tempUrl, param).success(function(data,status, headers, config) {
            deferred.resolve(data);
        })
        .error(function(data,status, headers, config){
            deferred.reject("Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in");
        });
        return deferred.promise;
    };

    this.getPublicationDetails = function(row){
        var pubobj = new Object();
        pubobj['pG']  = row.pG;
        pubobj['piG'] = row.piG;
        var param = JSON.stringify({
            "serviceName":"TnetMobileService",
            "methodName":"getPublicationDetails",
            "parameters":[null,{'user_id' : sharedProperties.getAppId(),'student_guid': sharedProperties.getStudentSelectedGuid(),'pubobj':pubobj }]
        });
        var tempUrl = "http://"+sharedProperties.getInstName()+"/"+url;
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        var deferred = $q.defer();
        $http.post(tempUrl, param).success(function(data) {
            deferred.resolve(data);
        })
        .error(function(data){
            deferred.reject("Please give instance name correct,Wrong Instance Name. eg: xyz.pupilpod.in");
        });
        return deferred.promise;
    };
	
	this.getAllNotification = function($scope){
		if($scope.db == null || $scope.db == ''){
			var shortName = 'tnet_pupilpod';
			var version = '1.0';
			var displayName = 'Tnet_Pupilpod';
			var maxSize = 65535;
			db = $window.openDatabase(shortName, version, displayName,maxSize);
			db.transaction(createTable,errorHandlerTransaction,nullHandler);
			$scope.db = db;		
		}
		$scope.db.transaction(function(transaction) {
			var tempData = new Array();
			var tempData1 = new Array();
			transaction.executeSql("SELECT * FROM tnet_notification_details", [],function(transaction, resultT2)
			{
				for (var i = 0; i < resultT2.rows.length; i++) {
					var row = resultT2.rows.item(i);
					if(((resultT2.rows.length) - i) < 4){
						tempData.push(row);
					}
					tempData1.push(row);
				}
			},errorHandlerQuery); 
			myCache.put('messageDashboard',tempData);
			myCache.put('allMessages',tempData1);
			},errorHandlerTransaction,nullHandler);
	};
});



