define(['angular', 'lodash'], function(angular, _) {
    'use strict';

    return ['$scope', 'gettext', 'notify', 'api',
        function($scope, gettext, notify, api) {

            var _desk = null;
			$scope.editDesk = null;
			$scope.memberPopup = null;
            $scope.selectedMembers = [];
            $scope.membersToSelect = [];
            $scope.desk = null;
            $scope.memberScreen2 = false;

            api.desks.query()
            .then(function(desks) {
                $scope.desks = desks;
            });

            api.users.query()
            .then(function(users) {
                $scope.users = users._items;
            });

			$scope.getMembers = function(desk) {
				var members = [];
				if ($scope.desks !== undefined && $scope.users !== undefined) {
                    angular.forEach(desk.members, function(value) {
                        members.push(_.find($scope.users, {_id: value}));
                    });
                }
                return members;
			};

            $scope.edit = function(desk) {
				$scope.editDesk = _.create(desk);
                _desk = desk || {};
			};

			$scope.cancel = function() {
				$scope.editDesk = null;
			};

			$scope.save = function(desk) {
                notify.info(gettext('saving...'));
                var _new = desk._id ? false : true;
				api.desks.save(_desk, $scope.editDesk).then(function(result) {
                    notify.pop();
                    if (_new) {
                        notify.success(gettext('New Desk created.'));
                        _.extend(desk, result);
                        $scope.desks._items.unshift($scope.editDesk);
                    } else {
                        notify.success(gettext('Desk settings updated.'));
                        _.extend(_desk, result);
                    }
					$scope.cancel();
                }, function(response) {
                    notify.pop();
                    notify.error(gettext('There was a problem, desk not created/updated.'));
                });
			};

			$scope.remove = function(desk) {
                api.desks.remove(desk).then(function() {
                    _.remove($scope.desks._items, desk);
                    notify.success(gettext('Desk deleted.'), 3000);
                });
            };

            $scope.openMembers = function(desk) {
                $scope.desk = desk;
                $scope.memberPopup = {};
                angular.forEach(desk.members, function(value) {
                    $scope.selectedMembers.push(_.find($scope.users, {_id: value}));
                });
                $scope.membersToSelect = _.without($scope.users, $scope.selectedMembers);
            };

            $scope.cancelMember = function(desk) {
                $scope.selectedMembers = [];
                $scope.memberPopup = null;
                $scope.memberScreen2 = false;
            };

            $scope.addMember = function(member) {
                $scope.selectedMembers.push(member);
            };

            $scope.removeMember = function(member) {
                $scope.selectedMembers = _.without($scope.selectedMembers, member);
            };

            $scope.saveMembers = function() {
                var members = _.map($scope.selectedMembers, function(obj) {
                    return obj._id;
                });
                api.desks.save($scope.desk, {members: members}).then(function(result) {
					_.extend($scope.desk, result);
					notify.success(gettext('Desk members updated.'), 3000);
					$scope.cancelMember();
                }, function(response) {
                    notify.error(gettext('There was a problem, desk members not updated.'));
                });
            };

            $scope.notIn = function(array) {
                return function(item) {
                    return array.indexOf(item) === -1;
                };
            };
		}];
});
