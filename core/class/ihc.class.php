<?php
require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';

include_file('core', 'cmdt', 'class', 'ihc');

$pingOldState;

class ihc extends eqLogic {

	/*public static function IHC_addState() {
		foreach(eqLogic::byType('ihc') as $Equipement){		
			if($Equipement->getIsEnable()){
				foreach($Equipement->getCmd() as $Commande){
					log::add('ihc', 'debug', $Commande->getHumanName().'[Comande] '.$Commande);
					if ($Commande->getConfiguration('IhcObjectType') == "Etat"){
						$ResourceID=$Commande->getLogicalId();
						$_eq = $Commande->getEqLogic();
						if($Commande->getType() == 'info'){
							log::add('ihc', 'debug', $Commande->getHumanName().'[Etat] ResourceID: '.$ResourceID.' eqLogic: '.$_eq);
						}		
					}
				}
			}
		}
	}*/
	
	



	public function preInsert() {
		if (is_object(eqLogic::byLogicalId($this->getLogicalId(),'ihc')))     
			$this->setLogicalId('');
	}
	public function preSave() {
		$this->setLogicalId(trim($this->getLogicalId()));    
	}	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//                                                                                                                                               //
	//                                                      Gestion des Template d'equipement                                                       // 
	//                                                                                                                                               //
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public static function devicesParameters($_device = '') {
		$path = dirname(__FILE__) . '/../config/devices';
		if (isset($_device) && $_device != '') {
			$files = ls($path, $_device . '.json', false, array('files', 'quiet'));
			if (count($files) == 1) {
				try {
					$content = file_get_contents($path . '/' . $files[0]);
					if (is_json($content)) {
						$deviceConfiguration = json_decode($content, true);
						return $deviceConfiguration[$_device];
					}
				} catch (Exception $e) {
					return array();
				}
			}
		}
		$files = ls($path, '*.json', false, array('files', 'quiet'));
		$return = array();
		foreach ($files as $file) {
			try {
				$content = file_get_contents($path . '/' . $file);
				if (is_json($content)) {
					$return = array_merge($return, json_decode($content, true));
				}
			} catch (Exception $e) {
			}
		}
		if (isset($_device) && $_device != '') {
			if (isset($return[$_device])) {
				return $return[$_device];
			}
			return array();
		}
		return $return;
	}
	public function applyModuleConfiguration($template, $TemplateOptions=null) {
		if ($template == '') {
			$this->save();
			return true;
		}
		$typeTemplate=$template;
		$device = self::devicesParameters($template);
		if (!is_array($device) || !isset($device['cmd'])) {
			return true;
		}
		if (isset($device['category'])) {
			foreach ($device['category'] as $key => $value) {
				$this->setCategory($key, $value);
			}
		}
		if (isset($device['configuration'])) {
			foreach ($device['configuration'] as $key => $value) {
				$this->setConfiguration($key, $value);
			}
		}
		foreach ($device['cmd'] as $command) {
			$cmd = null;
			foreach ($this->getCmd() as $liste_cmd) {
				if (isset($command['name']) && $liste_cmd->getName() == $command['name']) {
					$cmd = $liste_cmd;	
					break;
				}
			}
			$this->createTemplateCmd($cmd,$command);
		}
		if(is_array($TemplateOptions)){
			foreach ($device['options'] as $DeviceOptionsId => $DeviceOptions) {
				if(isset($TemplateOptions[$DeviceOptionsId])){
					$typeTemplate.='_'.$DeviceOptionsId;
					foreach ($DeviceOptions['cmd'] as $command) {
						$cmd = null;
						foreach ($this->getCmd() as $liste_cmd) {
							if (isset($command['name']) && $liste_cmd->getName() == $command['name']) {
								$cmd = $liste_cmd;	
								break;
							}
						}
						$this->createTemplateCmd($cmd,$command);
					}
				}
			}
		}
		$this->setConfiguration('typeTemplate',$typeTemplate);
		$this->save();
	}
	public function createTemplateCmd($cmd,$command) {		
		try {
			if ($cmd == null || !is_object($cmd)) {
				$cmd = new ihcCmd();
				$cmd->setEqLogic_id($this->getId());
			} else {
				$command['name'] = $cmd->getName();
			}
			utils::a2o($cmd, $command);
			if (isset($command['value']) && $command['value']!="") {
				$CmdValue=cmd::byEqLogicIdCmdName($this->getId(),$command['value']);
				if(is_object($CmdValue))
					$cmd->setValue('#'.$CmdValue->getId().'#');
				else
					$cmd->setValue(null);
			}
			if (isset($command['configuration']['option']) && $command['configuration']['option']!="") {
				$options=array();
				foreach($command['configuration']['option'] as $option => $cmdOption){
					$options[$option]=$cmdOption;
					$CmdValue=cmd::byEqLogicIdCmdName($this->getId(),$cmdOption);
					if(is_object($CmdValue))
						$options[$option]='#'.$CmdValue->getId().'#';
				}
				$cmd->setConfiguration('option',$options);
			}
			$cmd->save();
		} catch (Exception $exc) {
			error_log($exc->getMessage());
		}
	}

	public static function updateValue($result) {
		$ResourceID = $result['ResourceID'];
		$Value = $result['Value'];
		switch ($Value) {
			case 'True':
				$Value = 1;
				break;
			case 'False':
				$Value = 0;
				break;
			default:
				//Keep $value Value
				break;
			}
		log::add('ihc','debug','[State changes] '.$ResourceID.' : '.$Value);
		foreach(eqLogic::byType('ihc') as $Equipement){		
			if($Equipement->getIsEnable()){
				foreach($Equipement->getCmd() as $Commande){
					if($Commande->getType() == 'info'){
						if ($Commande->getConfiguration('IhcObjectType') == "Etat"){
							$CmdResourceID=$Commande->getLogicalId();
							if ($ResourceID == $CmdResourceID) {
								$_eq = $Commande->getEqLogic();
								$_eq->checkAndUpdateCmd($ResourceID,$Value);
							}
						}
					}
				}
			}
		}
	}

	/*public static function networkStatus($result) {
		$status = $result['networkStatus'];
		if ($status == 'True') {
			log::add('ihc','info','Ping réussi vers le contrôleur IHC, redémarrage du démon.');
			self::deamon_start();
		} else {
			log::add('ihc','info','Ping échoué vers le contrôleur IHC, en attente de reconnexion.');
		}
	}*/

	/*public static function cron() {
		ihc::ihcNotify();
	}*/

	public static function ihcNotify() {
		$data = [];
		foreach(eqLogic::byType('ihc') as $Equipement){		
			if($Equipement->getIsEnable()){
				foreach($Equipement->getCmd() as $Commande){
					if($Commande->getType() == 'info'){
						if ($Commande->getConfiguration('IhcObjectType') == "Etat"){
							$ResourceID=$Commande->getLogicalId();
							$_id = $Commande->getId();
							array_push($data, array("id" => $_id, "ResourceID" => intval($ResourceID)));
						}
					}
				}
			}
		}
		$params = array(
			'method' => 'IHC_Notify',
			'resids' => $data
		);
		$send = ihc::sendToDaemon($params);
    }
		
	// Fonction exécutée automatiquement après la sauvegarde (création ou mise à jour) de l'équipement 
    public function postSave() {
		$deamon_info = self::deamon_info();
		if ($deamon_info['state'] == 'ok') {
			ihc::ihcNotify();
			if($this->getIsEnable()){
					foreach($this->getCmd() as $Commande){
						if($Commande->getType() == 'info'){
							if ($Commande->getConfiguration('IhcObjectType') == "Etat"){
								$ResourceID=$Commande->getLogicalId();
								$params = array(
								'method' => 'IHC_Read',
								'resid' => $ResourceID
								);
									$send = ihc::sendToDaemon($params);
							}
						}
					}
			}
		}
    }

	public static function dependancy_install() {
		log::remove(__CLASS__.'_update');
		return array('script' => dirname(__FILE__) . '/../../resources/install_#stype#.sh ' . jeedom::getTmpFolder(__CLASS__) . '/dependency', 'log' => log::getPathToLog(__CLASS__.'_update'));
	}

	public static function dependancy_info() {
		$return = array();
		$return['log'] = log::getPathToLog(__CLASS__.'_update');
		$return['progress_file'] = jeedom::getTmpFolder(__CLASS__) . '/dependency';
		if (file_exists(jeedom::getTmpFolder(__CLASS__) . '/dependency')) {
			$return['state'] = 'in_progress';
		} else {
			if (exec(system::getCmdSudo() . system::get('cmd_check') . '-Ec "python3\-requests"') < 1) {
				$return['state'] = 'nok';
			} else {
				$return['state'] = 'ok';
			}
		}
		return $return;
	}

	public static function deamon_info() {
		$return = array();
		$return['log'] = __CLASS__;
		$return['state'] = 'nok';

		$pid_file = jeedom::getTmpFolder(__CLASS__) . '/deamon.pid';
		if (file_exists($pid_file)) {
			if (@posix_getsid(trim(file_get_contents($pid_file)))) {
				$return['state'] = 'ok';
			} else {
				shell_exec(system::getCmdSudo() . 'rm -rf ' . $pid_file . ' 2>&1 > /dev/null');
			}
		}
		$return['launchable'] = 'ok';
		$controllerID = config::byKey('controllerID', __CLASS__);
		$controllerPW = config::byKey('controllerPW', __CLASS__);
		$controllerIP = config::byKey('controllerIP', __CLASS__);
		if ($controllerID=='') {
			$return['launchable'] = 'nok';
			$return['launchable_message'] = __('Le nom d\'utilisateur n\'est pas configuré', __FILE__);

		} elseif ($controllerPW=='') {
			$return['launchable'] = 'nok';
			$return['launchable_message'] = __('Le mot de passe n\'est pas configuré', __FILE__);
		} elseif ($controllerIP=='') {
			$return['launchable'] = 'nok';
			$return['launchable_message'] = __('L\'adresse IP du contrôleur n\'est pas configurée', __FILE__);
		}
		return $return;
	}

	public static function deamon_start() {
		self::deamon_stop();
		$deamon_info = self::deamon_info();
		if ($deamon_info['launchable'] != 'ok') {
			throw new Exception(__('Veuillez vérifier la configuration', __FILE__));
		}

		$path = realpath(dirname(__FILE__) . '/../../resources/ihc');
		$cmd = 'sudo python3 ' . $path . '/ihc.py';
		$cmd .= ' --loglevel ' . log::convertLogLevel(log::getLogLevel(__CLASS__));
		$cmd .= ' --socketport ' . config::byKey('socketport', __CLASS__, '55099');
		$cmd .= ' --callback ' . network::getNetworkAccess('internal', 'proto:127.0.0.1:port:comp') . '/plugins/ihc/core/php/deamonIHC.php';
		$cmd .= ' --controllerID "' . trim(str_replace('"', '\"', config::byKey('controllerID', __CLASS__))) . '"';
		$cmd .= ' --controllerPW "' . trim(str_replace('"', '\"', config::byKey('controllerPW', __CLASS__))) . '"';
		$cmd .= ' --controllerIP "' . trim(str_replace('"', '\"', config::byKey('controllerIP', __CLASS__))) . '"';
		$cmd .= ' --apikey ' . jeedom::getApiKey(__CLASS__);
		$cmd .= ' --pid ' . jeedom::getTmpFolder(__CLASS__) . '/deamon.pid';
		log::add(__CLASS__, 'info', 'Lancement démon IHC');
		$result = exec($cmd . ' >> ' . log::getPathToLog('ihc_daemon') . ' 2>&1 &');
		$i = 0;
		while ($i < 20) {
			$deamon_info = self::deamon_info();
			if ($deamon_info['state'] == 'ok') {
				ihc::ihcNotify();
				break;
			}
			sleep(1);
			$i++;
		}
		if ($i >= 30) {
			log::add(__CLASS__, 'error', __('Impossible de lancer le démon IHC, vérifiez le log',__FILE__), 'unableStartDeamon');
			return false;
		}
		message::removeAll(__CLASS__, 'unableStartDeamon');
		return true;
	}

	public static function deamon_stop() {
		$pid_file = jeedom::getTmpFolder(__CLASS__) . '/deamon.pid';
		if (file_exists($pid_file)) {
			$pid = intval(trim(file_get_contents($pid_file)));
			system::kill($pid);
		}
		system::kill('ihc.py');
		// system::fuserk(config::byKey('socketport', __CLASS__));
		sleep(1);
	}

	public static function sendToDaemon($params) {
		$deamon_info = self::deamon_info();
		if ($deamon_info['state'] != 'ok') {
			throw new Exception("Le démon n'est pas démarré");
		}
		$payLoad = json_encode($params);
		$socket = socket_create(AF_INET, SOCK_STREAM, 0);
		socket_connect($socket, '127.0.0.1', config::byKey('socketport', __CLASS__, '55099'));
		socket_write($socket, $payLoad, strlen($payLoad));
		socket_close($socket);
	}




}

class ihcCmd extends cmd {
	public function preSave() { 
		if ($this->getConfiguration('IhcObjectType') == '') 
			throw new Exception(__('Le type de commande ne peut être vide', __FILE__));
		$this->setLogicalId(trim($this->getLogicalId()));    
	}

	public function getOtherActionValue(){
		$ActionValue = jeedom::evaluateExpression($this->getConfiguration('IhcObjectValue'));
		if ($this->getConfiguration('IhcObjectValue') == "") 
			$ActionValue = Cmdt::OtherValue($this->getConfiguration('IhcObjectType'),jeedom::evaluateExpression($this->getValue()));
		return $ActionValue;
	}

	public function execute($_options = null){
	log::add('ihc','debug','execute ');
			$ResourceID=$this->getLogicalId();
			$dpt=$this->getConfiguration('IhcObjectType');
			$inverse=$this->getConfiguration('inverse');
			$Option=$this->getConfiguration('option');
			if($Option != '' && !is_array($Option))
				$Option = json_decode($Option,true);
			$Option['id']=$this->getId();
			switch ($this->getType()) {
				case 'action' :
					$Listener=cmd::byId(str_replace('#','',$this->getValue()));
					if (isset($Listener) && is_object($Listener)) 
						$inverse=$Listener->getConfiguration('inverse');
					switch ($this->getSubType()) {
						case 'slider':    
							$ActionValue = $_options['slider'];
						break;
						case 'color':
							$ActionValue = $_options['color'];
						break;
						case 'message':
							$ActionValue = $_options['message'];
						break;
						case 'select':
							$ActionValue = $_options['select'];
						break;
						case 'other':
							$ActionValue = $this->getOtherActionValue();
						break;
					}
					log::add('ihc','debug',$this->getHumanName().'[Write] Valeur a envoyer '.$ActionValue);
					$data= Cmdt::DptSelectEncode($dpt, $ActionValue, $inverse,$Option);
					if($ResourceID != '' && $data !== false){
						if ($data == 1){
							$ActionValue = true;
						} else {
							$ActionValue = false;
						}
						switch($dpt){
							case "Eclairage" : 
								$params = array(
									'method' => 'IHC_Write',
									'resid' => $ResourceID,
									'cmd' => $ActionValue
								);
								$send = ihc::sendToDaemon($params);
								break;
							case "Volet" : 
								$params = array(
									'method' => 'IHC_Write',
									'resid' => $ResourceID,
									'cmd' => true
								);
								$send = ihc::sendToDaemon($params);
									usleep(config::byKey('SendSleep','ihc')*1000);
								$params = array(
									'method' => 'IHC_Write',
									'resid' => $ResourceID,
									'cmd' => false
								);
								$send = ihc::sendToDaemon($params);
								break;
							case "Divers" : 
								$params = array(
									'method' => 'IHC_Write',
									'resid' => $ResourceID,
									'cmd' => true
								);
								$send = ihc::sendToDaemon($params);
									usleep(config::byKey('SendSleep','ihc')*1000);
								$params = array(
									'method' => 'IHC_Write',
									'resid' => $ResourceID,
									'cmd' => false
								);
								$send = ihc::sendToDaemon($params);
								break;
							default:
								$params = array(
									'method' => 'IHC_Write',
									'resid' => $ResourceID,
									'cmd' => $ActionValue
								);
								$send = ihc::sendToDaemon($params);
						}
					}
				break;
				case 'info':
						log::add('ihc','debug',$this->getHumanName().'[Read] Interrogation du contrôleur');
						$params = array(
							'method' => 'IHC_Read',
							'resid' => $ResourceID
							);
						$send = ihc::sendToDaemon($params);
				break;
			}
	}
	public function SendReply(){
		log::add('ihc', 'info',$this->getHumanName().'[Réponse]: Demande de valeur sur l\adresse de groupe : '.$this->getLogicalId());			
		$valeur='';
		$unite='';
		$dpt=$this->getConfiguration('IhcObjectType');
		$inverse=$this->getConfiguration('inverse');
		$Option=$this->getConfiguration('option');
		if($Option != '' && !is_array($Option))
			$Option = json_decode($Option,true);
		$Option['id']=$this->getId();
		if ($dpt != 'aucun' && $dpt!= ''){
			$unite=Cmdt::getDptUnite($dpt);
			$Listener=cmd::byId(str_replace('#','',$this->getValue()));
			if(is_object($Listener)) {
				$inverse=$Listener->getConfiguration('inverse');
				if($Listener->getLogicalId() == $this->getLogicalId()){
					log::add('ihc', 'debug', $this->getHumanName().'[Réponse]: Impossible de répondre avec le même GAD');
					return false;
				}
			}
			$valeur = $this->getOtherActionValue();
			if($valeur != false && $valeur != ''){
				$data= Cmdt::DptSelectEncode($dpt, $valeur, $inverse,$Option);
				log::add('ihc', 'info',$this->getHumanName().'[Réponse]: Réponse avec la valeur : '.$valeur.$unite);
				ihc::ihcReponse($this->getLogicalId(), $data);
			}
		}else{
			$valeur='Aucun DPT n\'est associé a cette adresse';
		}
		return $valeur.$unite ;
	}
	public function UpdateCommande($data){	
		$valeur='';		
		$dpt=$this->getConfiguration('IhcObjectType');
		$inverse=$this->getConfiguration('inverse');
		$Option=$this->getConfiguration('option');
		if($Option != '' && !is_array($Option))
			$Option = json_decode($Option,true);
		$Option['id']=$this->getId();
		if ($dpt != 'aucun' && $dpt!= ''){
			$unite=Cmdt::getDptUnite($dpt);
			log::add('ihc', 'debug',$this->getHumanName().' : Décodage de la valeur avec le DPT :'.$dpt);
			$valeur=Cmdt::DptSelectDecode($dpt, $data, $inverse, $Option);
			if($valeur !== false){
				if($this->getConfiguration('noBatterieCheck')){
					switch(explode('.',$dpt)[0]){
						case 1 :
							$valeur=$valeur*100;
						break;
					}
					$this->getEqlogic()->batteryStatus($valeur,date('Y-m-d H:i:s'));
				}
				if($this->getType() == 'info'){
					log::add('ihc', 'info',$this->getHumanName().' : Mise à jour de la valeur : '.$valeur.$unite);
					$this->event($valeur);
					$this->setCache('collectDate', date('Y-m-d H:i:s'));
				}
			}
		}else{
			$valeur='Aucun DPT n\'est associé a cette adresse';
		}
		return $valeur.$unite ;
	}
	public function UpdateCmdOption($_options) { 
		log::add('ihc', 'Info', 'Mise à jour d\'une commande par ses options');
		$dpt=$this->getConfiguration('IhcObjectType');
		$inverse=$this->getConfiguration('inverse');
		$Option=$this->getConfiguration('option');
		if($Option != '' && !is_array($Option))
			$Option = json_decode($Option,true);
		$Option['id']=$this->getId();
		$unite=Cmdt::getDptUnite($dpt);
		$valeur=Cmdt::DptSelectDecode($dpt, null, $inverse, $Option);
		if($this->getType() == 'info' && $valeur !== false){
			log::add('ihc', 'info',$this->getHumanName().' : Mise à jour de la valeur : '.$valeur.$unite);
			$this->event($valeur);
			$this->setCache('collectDate', date('Y-m-d H:i:s'));
		}
	}
}
?>
