submitSelfRegistrationRequest: function (data, event) {
				var self = data;
				if ('click' === event.type || 'blur' === event.type  || event.keyCode === 9) {
				    if(event.target.value === "")
				    {
				        event.target.style = "border: 2px solid #f33";
				        if(event.target.id !== null){
				            var label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:#f33";
    				        if(event.target.id === "CC-userRegistration-state1" || event.target.id === "CC-userRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>')
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-role")
    				        {
    				           $('.boxrole1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>')
    				        }
    				        if(event.target.id === "CC-userRegistration-typeAddress")
    				        {
    				            $('.boxtype').append('<style>.boxtype:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-state1")
    				        {
    				           $('.box3').append('<style>.box3:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-typeAddress")
    				        {
    				            $('.box4').append('<style>.box4:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-primaryBusiness")
    				        {
    				            $('.boxprimaryBusiness').append('<style>.boxprimaryBusiness:before{border-right:2px solid rgb(255, 51, 51);border-top:2px solid rgb(255, 51, 51);border-bottom:2px solid rgb(255, 51, 51);}</style>');
    				        }
				        }
				    }
				    else
				    {
				        event.target.style = "border: 2px solid #d3d3d";
				        if(event.target.id !== null){
				            var label = event.target.id + "-label"; 
    				        document.getElementById(label).style = "color:black";
    				        if(event.target.id === "CC-userRegistration-state1" || event.target.id === "CC-userRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>')
    				        }
    				         if(event.target.id === "CC-userBusinessRegistration-role")
    				        {
             		            $('.boxrole1').append('<style>.boxtype:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        if(event.target.id === "CC-userRegistration-typeAddress")
    				        {
    				            $('.boxtype').append('<style>.boxtype:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        
    				        if(event.target.id === "CC-userBusinessRegistration-state1")
    				        {
    				           $('.box3').append('<style>.box3:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-state")
    				        {
    				           $('.box1').append('<style>.box1:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				        if(event.target.id === "CC-userBusinessRegistration-typeAddress")
    				        {
    				            $('.box4').append('<style>.box4:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
    				         if(event.target.id === "CC-userBusinessRegistration-primaryBuiness")
    				        {
    				            $('.boxprimaryBusiness').append('<style>.boxprimaryBusiness:before{border-right:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;}</style>');
    				        }
				        }
				        if(event.target.id  === "CC-userRegistration-emailAddress")
				        {
				            self.emailAddressLostFocus();
				        }
				         if(event.target.id  === "CC-userBusinessRegistration-emailAddress")
				        {
				            self.emailAddressLostFocus();
				        }
				    }
				}
					if ('click' === event.type || (('keydown' === event.type || 'keypress' === event.type) && event.keyCode === 13)) {
					self.selfRegistrationRequest().organization.secondaryAddresses()[0].address.companyName(self.selfRegistrationRequest().name());
					console.log(self.selfRegistrationRequest().organization.secondaryAddresses()[0].address);
					var address = self.selfRegistrationRequest().organization.secondaryAddresses()[0].address;
					if (!self.userFound()) {
						self.selfRegistrationRequest.createSelfRegistrationRequest(self.createOrganizationRequestSuccess.bind(self), self.createOrganizationRequestFailure.bind(self));
					}
				}
				return true;
			};
				
			
			
			
			
			
			
//			 <div class="col-md-6 col-12" id="roles-div1">
  //  <label for="role" class="txtbold" id="CC-userBusinessRegistration-role-label">* Role</label><br>

 //<div class="boxrole1 col-md-12 col-12">
//<select id="CC-userBusinessRegistration-role" data-bind="options:$parent.rolesArray,optionsCaption:'Select Role', value: $parent.role, valueUpdate: 'afterkeydown',event:{ blur: function(data, event) { return //$parent.submitSelfRegistrationRequest.bind(data, $parent, event)() }}">
//</select>
 //</div>
 

//<br><br>
  //</div>