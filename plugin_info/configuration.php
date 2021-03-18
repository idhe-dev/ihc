﻿<?php
/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');
if (!isConnect()) {
  include_file('desktop', '404', 'php');
  die();
}
?>
<form class="form-horizontal">
    <legend><i class="fas fa-archive"></i> {{Connexion au Contrôleur IHC}}</legend>
      <fieldset>
        <div class="form-group">
				<label class="col-sm-5 control-label" >{{Mode de communication :}}</label>
				<div class="col-lg-3">
					<select class="configKey form-control" data-l1key="IhcSoft" >
						<option value="http">http</option>
						<option value="https">https</option>
					</select>
				</div>
	    </div>
        <div class="form-group">
          <label class="col-sm-5 control-label">{{Adresse IP Contrôleur}}</label>
          <div class="col-lg-3">
            <input class="configKey form-control" data-l1key="controllerIP"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-5 control-label">{{Identifiant}}</label>
          <div class="col-lg-3">
            <input class="configKey form-control" data-l1key="controllerID" value="admin"/>
          </div>
        </div>
        <div class="form-group">
          <label class="col-sm-5 control-label">{{Mot de passe}}</label>
          <div class="col-lg-3">
        <input type="password" class="configKey form-control" data-l1key="controllerPW" />
      </div>
        </div>
      </fieldset>
</form>