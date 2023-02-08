var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(1,'Connecting'); // status ok!

	self.init_tcp();
};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port (Default = 55503)',
			width: 6,
			default: '55503',
			regex: self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};


instance.prototype.actions = function(system) {
	var self = this;

	self.setActions({
		'cue_exec':    {
			label: 'Recall (cue)',
			options: [
				{
					type: 'textinput',
					label: 'Cue ID',
					id: 'cue',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'spec_code':	{
			label: 'Special Code'
			options: [
				{
					type: 'dropdown',
					label: 'Special Code',
					id: 's_code',
					choices: [
						{
							label: 'Restart Photon', id: '4'
						},
						{
							label: 'Reboot Server', id: '5'
						},
						{
							label: 'Quit Photon', id: '6'
						},
						{
							label: 'Shutdown Server', id: '7'
						},
						{
							label: 'Toggle UI Visibility', id: '10'
						},
					]
				}
			]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var cmd
	var opt = action.options

	switch (action.action){

		case 'cue_exec':
			cmd = '<photon> CUE_EXEC_ID '+ opt.cue + ' </photon>';
			break;
		
		case 'spec_code':
			cmd = '<photon> 90BC9E48_6D84_4F8C_AA23_72E3379AC71C '+ opt.s_code + ' </photon>';
			break;

	}

	if (cmd !== undefined) {
		debug('sending ',cmd,opt.cue,"to",self.config.host);

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd + "\n");
		} else {
			debug('Socket not connected :(');
		}

	}

	// debug('action():', action);

};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
