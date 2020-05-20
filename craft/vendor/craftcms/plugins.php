<?php

$vendorDir = dirname(__DIR__);
$rootDir = dirname(dirname(__DIR__));

return array (
  'craftcms/contact-form-honeypot' => 
  array (
    'class' => 'craft\\contactform\\honeypot\\Plugin',
    'basePath' => $vendorDir . '/craftcms/contact-form-honeypot/src',
    'handle' => 'contact-form-honeypot',
    'aliases' => 
    array (
      '@craft/contactform/honeypot' => $vendorDir . '/craftcms/contact-form-honeypot/src',
    ),
    'name' => 'Contact Form Honeypot',
    'version' => '1.0.2',
    'description' => 'Add a honeypot captcha to your Craft CMS contact form',
    'developer' => 'Pixel & Tonic',
    'developerUrl' => 'https://pixelandtonic.com/',
    'developerEmail' => 'support@craftcms.com',
    'documentationUrl' => 'https://github.com/craftcms/contact-form-honeypot',
    'changelogUrl' => 'https://raw.githubusercontent.com/craftcms/contact-form-honeypot/master/CHANGELOG.md',
    'downloadUrl' => 'https://github.com/craftcms/contact-form-honeypot/archive/master.zip',
  ),
  'craftcms/redactor' => 
  array (
    'class' => 'craft\\redactor\\Plugin',
    'basePath' => $vendorDir . '/craftcms/redactor/src',
    'handle' => 'redactor',
    'aliases' => 
    array (
      '@craft/redactor' => $vendorDir . '/craftcms/redactor/src',
    ),
    'name' => 'Redactor',
    'version' => '2.6.1',
    'description' => 'Edit rich text content in Craft CMS using Redactor by Imperavi.',
    'developer' => 'Pixel & Tonic',
    'developerUrl' => 'https://pixelandtonic.com/',
    'developerEmail' => 'support@craftcms.com',
    'documentationUrl' => 'https://github.com/craftcms/redactor/blob/v2/README.md',
  ),
  'craftcms/contact-form' => 
  array (
    'class' => 'craft\\contactform\\Plugin',
    'basePath' => $vendorDir . '/craftcms/contact-form/src',
    'handle' => 'contact-form',
    'aliases' => 
    array (
      '@craft/contactform' => $vendorDir . '/craftcms/contact-form/src',
    ),
    'name' => 'Contact Form',
    'version' => '2.2.7',
    'description' => 'Add a simple contact form to your Craft CMS site',
    'developer' => 'Pixel & Tonic',
    'developerUrl' => 'https://pixelandtonic.com/',
    'developerEmail' => 'support@craftcms.com',
    'documentationUrl' => 'https://github.com/craftcms/contact-form/blob/v2/README.md',
    'components' => 
    array (
      'mailer' => 'craft\\contactform\\Mailer',
    ),
  ),
  'nystudio107/craft-twigpack' => 
  array (
    'class' => 'nystudio107\\twigpack\\Twigpack',
    'basePath' => $vendorDir . '/nystudio107/craft-twigpack/src',
    'handle' => 'twigpack',
    'aliases' => 
    array (
      '@nystudio107/twigpack' => $vendorDir . '/nystudio107/craft-twigpack/src',
    ),
    'name' => 'Twigpack',
    'version' => '1.2.1',
    'description' => 'Twigpack is a bridge between Twig and webpack, with manifest.json & webpack-dev-server HMR support',
    'developer' => 'nystudio107',
    'developerUrl' => 'https://nystudio107.com/',
    'documentationUrl' => 'https://nystudio107.com/plugins/twigpack/documentation',
    'changelogUrl' => 'https://raw.githubusercontent.com/craft-nystudio107/twigpack/v1/CHANGELOG.md',
    'hasCpSettings' => false,
    'hasCpSection' => false,
    'components' => 
    array (
      'manifest' => 'nystudio107\\twigpack\\services\\Manifest',
    ),
  ),
);
