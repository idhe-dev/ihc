<?php
class Cmdt{
	public function DptSelectEncode ($dpt, $value, $inverse=false, $option=null){
		$All_DPT=self::All_DPT();
		switch ($dpt){
			case "Eclairage":
				if ($value != 0 && $value != 1)
					{
					$ValeurDpt=$All_DPT["Commandes"][$dpt]['Valeurs'];
					$value = array_search($value, $ValeurDpt); 
					}
				if ($inverse){
					if ($value == 0 )
						$value = 1;
					else
						$value = 0;
				}
				$data= $value;
				break;
		};
		return $data;
	}
	public function DptSelectDecode ($dpt, $data, $inverse=false, $option=null){
		if ($inverse)
			log::add('ihc', 'debug','La commande sera inversée');
		$All_DPT=self::All_DPT();
		switch ($dpt){
			case "Eclairage":
				$value = $data;		
				if ($inverse)
					{
					if ($value == 0 )
						$value = 1;
					else
						$value = 0;
					}
				break;
		};
		return $value;
	}
	public function OtherValue ($dpt, $oldValue){
		$All_DPT=self::All_DPT();
		switch ($dpt){
			default:
				$value=$oldValue;
			break;
			case "Eclairage":
				if ($oldValue == 1)
					$value=0;
				else
					$value=1;
			break;
		}
		return $value;
	}
	public function getDptUnite($dpt){
		$All_DPT=self::All_DPT();
		while ($Type = current($All_DPT))
			{
			while ($Dpt = current($Type)) 
				{	
				if ($dpt == key($Type))
					return $Dpt["Unite"];
				next($Type);
				}
			next($All_DPT);
			}
		return '';
		}
	public function getDptOption($dpt)	{
		$All_DPT=self::All_DPT();
		while ($Type = current($All_DPT))
			{
			while ($Dpt = current($Type)) 
				{	
				if ($dpt == key($Type))
					return $Dpt["Option"];
				next($Type);
				}
			next($All_DPT);
			}
		return ;
		}
	public function getDptActionType($dpt)	{
		$All_DPT=self::All_DPT();
		while ($Type = current($All_DPT))
			{
			while ($Dpt = current($Type)) 
				{	
				if ($dpt == key($Type))
					return $Dpt["ActionType"];
				next($Type);
				}
			next($All_DPT);
			}
		return 'other';
		}
	public function getDptInfoType($dpt)	{
		$All_DPT=self::All_DPT();
		while ($Type = current($All_DPT))
			{
			while ($Dpt = current($Type)) 
				{	
				if ($dpt == key($Type))
					return $Dpt["InfoType"];
				next($Type);
				}
			next($All_DPT);
			}
		return 'string';
		}
	public function getDptGenericType($dpt)	{
		$All_DPT=self::All_DPT();
		while ($Type = current($All_DPT))
			{
			while ($Dpt = current($Type)) 
				{	
				if ($dpt == key($Type))
					return $Dpt["GenericType"];
				next($Type);
				}
			next($All_DPT);
			}
		return ;
		}
	/*public function getDptFromData($data)	{
		if(!is_array($data))
			return "1.xxx";
		switch(count($data)){
			case 1:
				return "5.xxx";
			break;
			case 2:
				return "9.xxx";
			break;
			case 3:
				return "10.xxx";
			break;
			case 4:
				return "14.xxx";
			break;
			default:
				return false;
			break;
		}
	}*/
	public function All_DPT()	{
		return array (
		"Commandes"=> array(
			"Eclairage"=> array(
				"Name"=>"Generic",
				"Valeurs"=>array("Off", "On"),
				"min"=>'',
				"max"=>'',
				"InfoType"=>'binary',
				"ActionType"=>'other',
				"GenericType"=>"DONT",
				"Option" =>array(),
				"Unite" =>""),
			"Etat"=> array(
				"Name"=>"Generic",
				"Valeurs"=>array("Off", "On"),
				"min"=>'',
				"max"=>'',
				"InfoType"=>'binary',
				"ActionType"=>'other',
				"GenericType"=>"DONT",
				"Option" =>array(),
				"Unite" =>""),
			"Hauteur"=> array(
				"Name"=>"Scaling",
				"Valeurs"=>array(),
				"min"=>0,
				"max"=>100,
				"InfoType"=>'numeric',
				"ActionType"=>'slider',
				"Unite"=>"%"),
			"Volet"=> array(
				"Name"=>"Generic",
				"Valeurs"=>array("Impulse"),
				"min"=>'',
				"max"=>'',
				"InfoType"=>'binary',
				"ActionType"=>'other',
				"GenericType"=>"DONT",
				"Option" =>array(),
				"Unite" =>""),
			"Divers"=> array(
				"Name"=>"Impulsion",
				"Valeurs"=>array("Impulse"),
				"min"=>'',
				"max"=>'',
				"InfoType"=>'binary',
				"ActionType"=>'other',
				"GenericType"=>"DONT",
				"Option" =>array(),
				"Unite" =>""),
		)
		);
	}
}?>
