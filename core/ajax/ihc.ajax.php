<?php
try {
	require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';
    	include_file('core', 'authentification', 'php');
		include_file('core', 'cmdt', 'class', 'ihc');

    	if (!isConnect('admin')) {
        	throw new Exception(__('401 - Accès non autorisé', __FILE__));
    	}
	switch(init('action')){
		/*case 'setIsInclude':
			ajax::success(cache::set('ihc::isInclude',init('value'), 0));
		break;
		case 'getIsInclude':
			ajax::success(cache::byKey('ihc::isInclude')->getValue(false));
		break;*/
		case 'Read':
			$Commande=cmd::byLogicalId(init('Gad'))[0];
			if (is_object($Commande))
				ajax::success($Commande->execute());
			else
				ajax::success(false);
		break;
		case 'getTemplate':
			ajax::success(ihc::devicesParameters()[init('template')]);
		break;
	}
	
   throw new Exception(__('Aucune methode correspondante à : ', __FILE__) . init('action'));
    /*     * *********Catch exeption*************** */
} catch (Exception $e) {
    ajax::error(displayExeption($e), $e->getCode());
}
?>
