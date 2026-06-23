<?php

return [
    'auth' => [
        'account_created' => 'Compte cree avec succes.',
        'login_success' => 'Connexion reussie.',
        'logout_success' => 'Deconnexion reussie.',
        'invalid_credentials' => 'Les identifiants fournis sont incorrects.',
        'register_temporarily_unavailable' => 'Inscription temporairement indisponible. Reessayez dans quelques secondes.',
        'invalid_phone' => 'Numero de telephone invalide.',
        'otp_sms' => 'Votre code YaZoo est : :code. Il expire dans :minutes minutes.',
        'otp_sent_login' => 'Un code de connexion a ete envoye par SMS.',
        'otp_sent_register' => 'Un code d inscription a ete envoye par SMS.',
        'otp_missing' => 'Aucun code OTP valide n est disponible. Demandez un nouveau code.',
        'otp_invalid' => 'Le code OTP est invalide ou expire.',
        'otp_required_login' => 'Le code OTP est obligatoire pour se connecter avec le telephone.',
        'otp_required_register' => 'Le code OTP est obligatoire pour finaliser l inscription.',
        'contact_required_register' => 'Un email ou un numero de telephone est obligatoire pour creer un compte.',
        'phone_already_exists' => 'Ce numero de telephone est deja utilise.',
        'phone_not_found' => 'Aucun compte n est associe a ce numero de telephone.',
    ],
    'reviews' => [
        'created' => 'Avis envoye avec succes.',
        'already_submitted' => 'Vous avez deja laisse un avis pour cette mission.',
        'only_after_completion' => 'Un avis ne peut etre depose qu apres la fin de la mission.',
    ],
    'stories' => [
        'created' => 'Story ajoutee avec succes.',
        'viewed' => 'Story marquee comme vue.',
        'deleted' => 'Story supprimee avec succes.',
    ],
    'services' => [
        'deleted' => 'Service supprime avec succes.',
    ],
    'profile' => [
        'followed' => 'Profil suivi avec succes.',
        'unfollowed' => 'Abonnement retire avec succes.',
        'not_found' => 'Profil introuvable.',
    ],
    'marketplace' => [
        'animal_deleted' => 'Annonce supprimee avec succes.',
        'product_deleted' => 'Produit supprime avec succes.',
        'veterinarian_deleted' => 'Veterinaire supprime avec succes.',
    ],
    'posts' => [
        'deleted' => 'Post supprime avec succes.',
    ],
    'communities' => [
        'already_member' => 'Vous etes deja membre de cette communaute.',
        'request_sent' => 'Demande d adhesion envoyee. En attente d approbation.',
        'joined' => 'Vous avez rejoint la communaute.',
        'left' => 'Vous avez quitte la communaute.',
        'request_approved' => 'Demande approuvee avec succes.',
        'request_rejected' => 'Demande refusee.',
    ],
    'notifications' => [
        'read' => 'Notification marquee comme lue.',
        'all_read' => 'Toutes les notifications ont ete marquees comme lues.',
    ],
    'contact' => [
        'sent' => 'Message envoye avec succes.',
    ],
    'monitoring' => [
        'frontend_report_saved' => 'Rapport frontend enregistre.',
    ],
    'messages' => [
        'sent' => 'Message envoye.',
        'self_message' => 'Vous ne pouvez pas vous envoyer un message.',
        'contact_not_found' => 'Aucun utilisateur ne correspond a ce contact.',
    ],
    'admin' => [
        'post_deleted' => 'Post supprime par moderation admin.',
        'animal_deleted' => 'Annonce animal supprimee par moderation admin.',
        'product_deleted' => 'Produit supprime par moderation admin.',
        'community_deleted' => 'Communaute supprimee par moderation admin.',
    ],
    'security' => [
        'https_required' => 'HTTPS est obligatoire.',
    ],
];
