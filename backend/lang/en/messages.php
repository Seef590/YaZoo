<?php

return [
    'auth' => [
        'account_created' => 'Account created successfully.',
        'login_success' => 'Signed in successfully.',
        'logout_success' => 'Signed out successfully.',
        'invalid_credentials' => 'The provided credentials are incorrect.',
        'register_temporarily_unavailable' => 'Registration is temporarily unavailable. Try again in a few seconds.',
        'invalid_phone' => 'Invalid phone number.',
        'otp_sms' => 'Your YaZoo code is: :code. It expires in :minutes minutes.',
        'otp_sent_login' => 'A sign-in code was sent by SMS.',
        'otp_sent_register' => 'A registration code was sent by SMS.',
        'otp_missing' => 'No valid OTP code is available. Request a new code.',
        'otp_invalid' => 'The OTP code is invalid or expired.',
        'otp_required_login' => 'The OTP code is required to sign in with phone.',
        'otp_required_register' => 'The OTP code is required to complete registration.',
        'contact_required_register' => 'An email or phone number is required to create an account.',
        'phone_already_exists' => 'This phone number is already used.',
        'phone_not_found' => 'No account is associated with this phone number.',
    ],
    'reviews' => [
        'created' => 'Review sent successfully.',
        'already_submitted' => 'You have already submitted a review for this mission.',
        'only_after_completion' => 'A review can only be submitted after the mission is completed.',
    ],
    'stories' => [
        'created' => 'Story added successfully.',
        'viewed' => 'Story marked as viewed.',
        'deleted' => 'Story deleted successfully.',
    ],
    'services' => [
        'deleted' => 'Service deleted successfully.',
    ],
    'profile' => [
        'followed' => 'Profile followed successfully.',
        'unfollowed' => 'Follow removed successfully.',
        'not_found' => 'Profile not found.',
    ],
    'marketplace' => [
        'animal_deleted' => 'Listing deleted successfully.',
        'product_deleted' => 'Product deleted successfully.',
        'veterinarian_deleted' => 'Veterinarian deleted successfully.',
    ],
    'posts' => [
        'deleted' => 'Post deleted successfully.',
    ],
    'communities' => [
        'already_member' => 'You are already a member of this community.',
        'request_sent' => 'Membership request sent. Waiting for approval.',
        'joined' => 'You joined the community.',
        'left' => 'You left the community.',
        'request_approved' => 'Request approved successfully.',
        'request_rejected' => 'Request rejected.',
    ],
    'notifications' => [
        'read' => 'Notification marked as read.',
        'all_read' => 'All notifications were marked as read.',
    ],
    'contact' => [
        'sent' => 'Message sent successfully.',
    ],
    'monitoring' => [
        'frontend_report_saved' => 'Frontend report saved.',
    ],
    'messages' => [
        'sent' => 'Message sent.',
        'self_message' => 'You cannot send a message to yourself.',
        'contact_not_found' => 'No user matches this contact.',
    ],
    'admin' => [
        'post_deleted' => 'Post deleted by admin moderation.',
        'animal_deleted' => 'Animal listing deleted by admin moderation.',
        'product_deleted' => 'Product deleted by admin moderation.',
        'community_deleted' => 'Community deleted by admin moderation.',
    ],
    'security' => [
        'https_required' => 'HTTPS is required.',
    ],
];
