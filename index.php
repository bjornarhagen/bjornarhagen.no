<?php
    if (isset($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] != 'bjornar.hagen.codes') {
        header('Location: https://bjornar.hagen.codes/');
    }
?>
<?php require_once('templates/head.php'); ?>
</head>
<body id="index">
    <?php require_once('templates/nav-index.php'); ?>
    <header class="wrapper">
        <div class="wrapper-inner">
            <h2>Front-end web designer</h2>
            <h1>Bjørnar Hagen</h1>
            <p>I'm a front-end web designer — Focused on creating minimal interfaces for web, desktop & mobile.</p>
            <p>Currently at <a href="https://datahjelpen.no" target="_blank">Datahjelpen AS</a>.</p>
            <p><a href="mailto:b@datahjelpen.no">Send me an email.</a></p>
        </div>
        </header>
    <?php require_once('templates/footer.php'); ?>
</body>
</html>
