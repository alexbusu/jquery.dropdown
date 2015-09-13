<?php
$tz = timezone_identifiers_list();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>jQuery.Dropdown</title>
    <link rel="stylesheet" href="css/jquery.dropdown.css">
</head>
<body>

<label for="dropdown" style="font-family: Arial, sans-serif; font-size: 14px; margin-right: 10px;">Select timezone</label>
<select name="dropdown" id="dropdown">
    <?php foreach( $tz as $index => $timezone ){ ?>
        <option value="<?php echo $index ?>"><?php echo $timezone ?></option>
    <?php } ?>
</select>

<script type="application/javascript" src="vendor/components/jquery/jquery.min.js"></script>
<script type="application/javascript" src="jquery.dropdown.js"></script>
<script>
    $(function(){
        $('select').dropdown();
    });
</script>
</body>
</html>