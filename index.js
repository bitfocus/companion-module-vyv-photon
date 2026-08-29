import { Regex, InstanceBase, TCPHelper, InstanceStatus, runEntrypoint } from '@companion-module/base'
import { getActionDefinitions } from './actions.js'
import { getPresetDefinitions } from './presets.js'
import { UpgradeScripts } from './upgrades.js'

class instance extends InstanceBase {
	async init(config) {
		this.config = config
		this.connectionFailures = 0
		this.reconnectInterval = 5000
		this.init_variables()
		if (this.config.verbose) {
			this.log('info', `Initializing module with config: ${JSON.stringify(this.config)}`)
		}

		// If no host is provided, show bad config status
		if (!this.config.host) {
			this.log('error', 'Initialization aborted: Host not set')
			this.updateStatus(InstanceStatus.BadConfig, 'Host not set')
			this.setVariableValues({
				connection_status: 'bad_config',
				target_ip: '',
				target_port: '',
				connection_failures: this.connectionFailures.toString()
			});
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.setVariableValues({
			connection_status: 'connecting',
			target_ip: this.config.host || '',
			target_port: this.config.port?.toString() || '',
			connection_failures: this.connectionFailures.toString()
		});
		if (this.config.verbose) {
			this.log('info', 'Status set to Connecting')
		}

		this.init_actions()
		this.init_presets()
		this.init_tcp()
	}

	async configUpdated(config) {
		if (config.verbose) {
			this.log('info', `Configuration updated: ${JSON.stringify(config)}`)
		}
		this.config = config
		this.init_tcp()
	}

	// Cleanup when module is removed
	async destroy() {
		if (this.config.verbose) {
			this.log('info', 'Destroy called, tearing down socket if exists')
		}
		if (this.socket) {
			this.socket.destroy()
			if (this.config.verbose) {
				this.log('info', 'Socket destroyed')
			}
		}
	}

	init_variables() {
		this.setVariableDefinitions([
			{ variableId: 'connection_status', name: 'Connection Status' },
			{ variableId: 'target_port', name: 'Target Port' },
			{ variableId: 'target_ip', name: 'Target IP Address' },
			{ variableId: 'connection_failures', name: 'Connection Failures' }
		])
		this.setVariableValues({
			connection_status: 'unknown',
			target_port: this.config.port?.toString() || '',
			target_ip: this.config.host || '',
			connection_failures: this.connectionFailures?.toString() || '0'
		})
	}

	init_tcp() {
		if (this.config.verbose) {
			this.log('info', 'init_tcp() called')
		}
		// Tear down any existing socket
		if (this.socket) {
			if (this.config.verbose) {
				this.log('debug', 'Existing socket found, destroying it')
			}
			this.socket.destroy()
			delete this.socket
		}

		// Validate host
		if (!this.config.host) {
			this.log('error', 'TCP initialization aborted: Host not set')
			this.updateStatus(InstanceStatus.BadConfig, 'Host not set')
			this.setVariableValues({
				connection_status: 'bad_config',
				target_ip: '',
				target_port: '',
				connection_failures: this.connectionFailures.toString()
			});
			return
		}

		if (this.config.verbose) {
			this.log('info', `Attempting to connect to ${this.config.host}:${this.config.port} (interval ${this.reconnectInterval}ms)`)
		}

		// Create TCP helper with auto-reconnect
		this.socket = new TCPHelper(this.config.host, this.config.port, {
			reconnect: false,
		})

		// Reflect status changes from TCPHelper
		this.socket.on('status_change', (status, message) => {
			if (this.config.verbose) {
				this.log('info', `TCP status changed: ${status} (${message})`)
			}
			this.updateStatus(status, message)
			// Map InstanceStatus to variable string
			let varValue = 'disconnected'
			switch (status) {
				case InstanceStatus.Ok:
					varValue = 'connected'
					break
				case InstanceStatus.Connecting:
					varValue = 'connecting'
					break
				case InstanceStatus.Disconnected:
				case InstanceStatus.UnknownError:
					varValue = 'disconnected'
					break
				case InstanceStatus.BadConfig:
					varValue = 'bad_config'
					break
			}
			this.setVariableValues({
				connection_status: varValue,
				target_ip: this.config.host || '',
				target_port: this.config.port?.toString() || '',
				connection_failures: this.connectionFailures.toString()
			})
		})

		this.socket.on('connect', () => {
			if (this.config.verbose) {
				this.log('info', `TCP connection established to ${this.config.host}:${this.config.port}`)
			}
			this.updateStatus(InstanceStatus.Ok)
			this.setVariableValues({
				connection_status: 'connected',
				connection_failures: this.connectionFailures.toString()
			});
			if (this.config.verbose) {
				this.log('info', 'Status set to Ok')
			}
			if (this.actions) {
				if (this.config.verbose) {
					this.log('debug', 'Subscribing to actions after connect')
				}
				this.subscribeActions()
			}
			this.connectionFailures = 0
			this.setVariableValues({
				connection_status: 'connected',
				connection_failures: this.connectionFailures.toString()
			});
			if (this.reconnectInterval !== 5000) {
			  this.reconnectInterval = 5000
			  this.log('info', 'Connection successful. Resetting reconnect interval to 5 seconds.')
			  this.init_tcp()
			}
		})

		this.socket.on('error', (err) => {
			this.log('error', `Network error: ${err.message}`)
			this.connectionFailures++
			this.setVariableValues({
				connection_status: 'disconnected',
				target_ip: this.config.host || '',
				target_port: this.config.port?.toString() || '',
				connection_failures: this.connectionFailures.toString()
			})
			if (this.connectionFailures >= 3 && this.reconnectInterval < 10000) {
				this.reconnectInterval = 10000
				this.log('warn', 'Too many failures. Slowing reconnect interval to 10 seconds.')
			}

			setTimeout(() => {
				this.init_tcp()
			}, this.reconnectInterval)
		})

		this.socket.on('close', () => {
			if (this.config.verbose) {
				this.log('warn', 'TCP connection closed')
			}
			this.setVariableValues({
				connection_status: 'disconnected',
				connection_failures: this.connectionFailures.toString()
			});

			setTimeout(() => {
				this.init_tcp()
			}, this.reconnectInterval)
		})

		this.socket.on('data', (data) => {
			const received = data.toString()
			if (this.config.verbose) {
				this.log('debug', `Received raw data: ${received}`)
			}
			// TODO: parse incoming messages and log parsed values
		})
	}

	// Return config fields for web config UI
	getConfigFields() {
		if (this.config && this.config.verbose) {
			this.log('debug', 'getConfigFields() called')
		}
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port (Default = 55503)',
				width: 6,
				default: 55503,
				regex: Regex.PORT,
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable verbose logging',
				default: false,
			},
		]
	}

	// Send a raw command string to Photon over the active TCP socket
	sendCommand(cmd) {
		if (this.config.verbose) {
			this.log('info', `sendCommand() called with cmd: ${cmd}`)
		}
		if (this.socket && this.socket.isConnected) {
			if (this.config.verbose) {
				this.log('debug', 'Socket is connected, sending command')
			}
			this.socket.send(cmd + '\n')
			if (this.config.verbose) {
				this.log('info', 'Command sent')
			}
		} else {
			this.log('warn', 'sendCommand: Socket not connected, cannot send')
		}
	}

	// Define and initialize actions
	init_actions() {
		if (this.config.verbose) {
			this.log('info', 'Initializing action definitions')
		}
		this.setActionDefinitions(getActionDefinitions(this))
	}

	// Define and initialize presets
	init_presets() {
		if (this.config.verbose) {
			this.log('info', 'Initializing preset definitions')
		}
		this.setPresetDefinitions(getPresetDefinitions())
	}
}

runEntrypoint(instance, UpgradeScripts)
