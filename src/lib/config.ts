export interface FormFieldConfig {
  name: string
  label: string
  placeholder: string
  description: string
  type: 'text' | 'number' | 'url' | 'textarea'
  required: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  validationMessage?: string
}

export interface FormSectionConfig {
  id: string
  title: string
  description: string
  icon: string
  fields: FormFieldConfig[]
}

export interface ApplicationConfig {
  // Discord Role Configuration
  roles: {
    // Roles that grant admin access
    adminRoles: string[]
    // Roles that grant high priority on applications
    priorityRoles: string[]
    // Roles that grant moderator access (view-only admin panel)
    moderatorRoles: string[]
    // Roles that grant reviewer access (can review applications)
    reviewerRoles: string[]
  }

  // Permission Configuration
  permissions: {
    // Who can approve/deny applications
    canReviewApplications: 'admin' | 'reviewer' | 'moderator'
    // Who can manage bans/blacklist
    canManageBans: 'admin' | 'moderator'
    // Who can view analytics
    canViewAnalytics: 'admin' | 'moderator'
    // Who can manage announcements
    canManageAnnouncements: 'admin' | 'moderator'
    // Who can manage rules
    canManageRules: 'admin' | 'moderator'
    // Who can view activity logs
    canViewActivityLog: 'admin' | 'moderator'
  }

  // Age Requirements
  minimumAge: number

  // Form Configuration
  sections: FormSectionConfig[]

  // Validation Messages
  messages: {
    ageRequirement: string
    steamIdInvalid: string
    cfxUrlInvalid: string
    experienceMinLength: string
    characterMinLength: string
  }

  // Discord Bot Configuration
  discordBot: {
    serverName: string;
    serverIcon: string;
    footerText: string;
  };

  // Website Branding Configuration
  website: {
    serverName: string;
    serverLogo: string;
    headerTitle: string;
    headerSubtitle: string;
    metaTitle: string;
    metaDescription: string;
    footerText: string;
  };

  // UI Configuration
  ui: {
    formTitle: string;
    formDescription: string;
    submitButtonText: string;
    submittingButtonText: string;
    successTitle: string;
    successDescription: string;
    errorTitle: string;
    errorDescription: string;
  };
}

export interface ServerStatusConfig {
  connectAddress: string
  maxPlayersFallback: number
  queueEnabled: boolean
  statusEndpoint?: string
  cacheSeconds: number
}

export const applicationConfig: ApplicationConfig = {
  // Discord Role Configuration
  roles: {
    // Roles that grant full admin access
    adminRoles: ['1492913271076946041', '1492913271156510881'],

    // Roles that grant high priority on applications
    priorityRoles: ['1492913271076946033', '1492913271076946032', '1492913271039332613', '1492913271039332612', '1492913271039332611', '1492913271039332610'],

    // Roles that grant moderator access (limited admin panel access)
    moderatorRoles: ['1492913271076946039'],

    // Roles that can review and approve/deny applications
    reviewerRoles: ['1492913271076946036'],
  },

  // Permission Configuration
  permissions: {
    canReviewApplications: 'reviewer', // admin, reviewer, or moderator
    canManageBans: 'moderator', // admin or moderator
    canViewAnalytics: 'moderator', // admin or moderator
    canManageAnnouncements: 'moderator', // admin or moderator
    canManageRules: 'admin', // admin only
    canViewActivityLog: 'moderator', // admin or moderator
  },

  // Minimum age requirement for applications
  minimumAge: 18,


  messages: {
    ageRequirement: 'You must be at least 18 years old.',
    steamIdInvalid: 'Invalid Steam ID. It should be a 17-digit number.',
    cfxUrlInvalid: 'Please enter a valid CFX account URL.',
    experienceMinLength: 'Please provide at least 50 characters about your RP experience.',
    characterMinLength: 'Please provide at least 100 characters about your character backstory.',
  },

  ui: {
    formTitle: 'Application Form',
    formDescription: 'Fill out all required information to submit your whitelist application',
    submitButtonText: 'Submit Application',
    submittingButtonText: 'Submitting Application...',
    successTitle: 'Application Submitted',
    successDescription: 'Your whitelist application has been received. We will review it shortly.',
    errorTitle: 'Submission Error',
    errorDescription: 'There was an error submitting your application. Please try again later.',
  },

  website: {
    serverName: "SOLACE",
    serverLogo: "https://r2.fivemanage.com/o0C1NVLtf4748HOANHSXf/k4uV1GyaGEWS.png",
    headerTitle: "Welcome to SOLACE",
    headerSubtitle: "Experience the ultimate FiveM roleplay server",
    metaTitle: "SOLACE - FiveM Roleplay Server",
    metaDescription: "Join SOLACE, the premier FiveM roleplay server. Apply for whitelist, explore our rules, and become part of our community.",
    footerText: "© 2026 SOLACE - All rights reserved",
  },

  discordBot: {
    serverName: "SOLACE",
    serverIcon: "https://r2.fivemanage.com/o0C1NVLtf4748HOANHSXf/k4uV1GyaGEWS.png",
    footerText: "© 2026 SOLACE - All rights reserved",
  },
}

export const serverStatusConfig: ServerStatusConfig = {
  connectAddress: 'cfx.re/join/vgjvze',
  maxPlayersFallback: 48,
  queueEnabled: true,
  statusEndpoint: process.env.FIVEM_STATUS_ENDPOINT,
  cacheSeconds: 15,
}

/*
EXAMPLES: How to add more questions and categories

1. Adding questions to existing roleplay section:
   Add these fields to the 'roleplay' section fields array:

   {
     name: 'motivation',
     label: 'What motivates your character?',
     placeholder: 'Describe what drives your character...',
     description: 'Explain your character\'s main motivations and goals',
     type: 'textarea',
     required: true,
     minLength: 50,
     validationMessage: 'Please provide at least 50 characters about your character\'s motivation.',
   },
   {
     name: 'weaknesses',
     label: 'Character Weaknesses',
     placeholder: 'What are your character\'s flaws and weaknesses?',
     description: 'Describe character flaws that make them more realistic',
     type: 'textarea',
     required: false,
     minLength: 30,
   }

2. Creating a new category/section:
   Add this object to the sections array:

   {
     id: 'background',
     title: 'Background & History',
     description: 'Detailed background information',
     icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
     fields: [
       {
         name: 'birthplace',
         label: 'Place of Birth',
         placeholder: 'City, State/Country',
         description: 'Where was your character born?',
         type: 'text',
         required: true,
       },
       {
         name: 'occupation',
         label: 'Previous Occupation',
         placeholder: 'What did your character do before?',
         description: 'Character\'s job/career before current events',
         type: 'text',
         required: true,
       },
       {
         name: 'education',
         label: 'Education Level',
         placeholder: 'High school, college, etc.',
         description: 'Highest level of education completed',
         type: 'text',
         required: false,
       }
     ],
   }

3. Adding a references section:
   {
     id: 'references',
     title: 'References',
     description: 'People who can vouch for you',
     icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
     fields: [
       {
         name: 'reference1',
         label: 'Reference 1 Discord Username',
         placeholder: '@username#1234',
         description: 'Someone who can vouch for your RP ability',
         type: 'text',
         required: false,
       },
       {
         name: 'reference2',
         label: 'Reference 2 Discord Username',
         placeholder: '@username#1234',
         description: 'Another person who knows your RP style',
         type: 'text',
         required: false,
       }
     ],
   }

4. Adding a rules agreement section:
   {
     id: 'rules',
     title: 'Server Rules Agreement',
     description: 'Confirm you understand our rules',
     icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
     fields: [
       {
         name: 'rulesAccepted',
         label: 'I have read and agree to follow all server rules',
         placeholder: '',
         description: 'You must accept the rules to apply',
         type: 'text', // Note: This would need custom checkbox implementation
         required: true,
         validationMessage: 'You must accept the server rules to continue.',
       }
     ],
   }

Remember to update the form schema generation in whitelist-form.tsx to handle new field types!
*/

export const getMinimumAge = () => applicationConfig.minimumAge
export const getFormSections = () => applicationConfig.sections
export const getFormField = (sectionId: string, fieldName: string) =>
  applicationConfig.sections
    .find(section => section.id === sectionId)
    ?.fields.find(field => field.name === fieldName)

// Role and Permission Helper Functions

/**
 * Check if user has admin role
 */
export const hasAdminRole = (userRoles: string[]): boolean => {
  return userRoles.some(role => applicationConfig.roles.adminRoles.includes(role))
}

/**
 * Check if user has moderator role
 */
export const hasModeratorRole = (userRoles: string[]): boolean => {
  return userRoles.some(role => applicationConfig.roles.moderatorRoles.includes(role))
}

/**
 * Check if user has reviewer role
 */
export const hasReviewerRole = (userRoles: string[]): boolean => {
  return userRoles.some(role => applicationConfig.roles.reviewerRoles.includes(role))
}

/**
 * Check if user has priority role (for application priority)
 */
export const hasPriorityRole = (userRoles: string[]): boolean => {
  return userRoles.some(role => applicationConfig.roles.priorityRoles.includes(role))
}

/**
 * Check if user has any staff role (admin, moderator, or reviewer)
 */
export const hasAnyStaffRole = (userRoles: string[]): boolean => {
  return hasAdminRole(userRoles) || hasModeratorRole(userRoles) || hasReviewerRole(userRoles)
}

/**
 * Check if user has permission to perform an action
 */
export const hasPermission = (
  userRoles: string[],
  permission: keyof typeof applicationConfig.permissions
): boolean => {
  const requiredLevel = applicationConfig.permissions[permission]

  // Check based on required permission level
  if (requiredLevel === 'admin') {
    return hasAdminRole(userRoles)
  } else if (requiredLevel === 'moderator') {
    return hasAdminRole(userRoles) || hasModeratorRole(userRoles)
  } else if (requiredLevel === 'reviewer') {
    return hasAdminRole(userRoles) || hasModeratorRole(userRoles) || hasReviewerRole(userRoles)
  }

  return false
}

/**
 * Get all configured role names
 */
export const getAllRoles = () => ({
  admin: applicationConfig.roles.adminRoles,
  priority: applicationConfig.roles.priorityRoles,
  moderator: applicationConfig.roles.moderatorRoles,
  reviewer: applicationConfig.roles.reviewerRoles,
})

/**
 * Get list of admin Discord IDs
 */
export const getAdminDiscordIds = () => applicationConfig.roles.adminRoles


// ============================================
// SHOP & PRICING CONFIGURATION
// ============================================

export interface ShopProduct {
  id: string
  name: string
  description: string
  price: number
  currency: 'USD' | 'EUR' | 'GBP'
  icon: string
  category: 'coins' | 'premium' | 'cosmetic' | 'bundle'
  image?: string
  bonus?: number
  highlighted?: boolean
  features?: string[]
  discountPercent?: number
}

export interface ShopConfig {
  enabled: boolean
  paypal: {
    clientId: string
    enabled: boolean
  }
  products: ShopProduct[]
}

export const shopConfig: ShopConfig = {
  enabled: false,
  paypal: {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  },
  products: [
    // Coins Packages
    {
      id: 'coins-100',
      name: '100 Coins',
      description: 'Small starter pack of coins',
      price: 4.99,
      currency: 'USD',
      icon: '💰',
      category: 'coins',
      features: ['100 In-Game Coins', 'Instant Delivery', '7-Day Support'],
    },
    {
      id: 'coins-500',
      name: '500 Coins',
      description: 'Great value coin package',
      price: 19.99,
      currency: 'USD',
      icon: '💰',
      category: 'coins',
      bonus: 50,
      highlighted: true,
      features: ['500 In-Game Coins', '+50 Bonus Coins', 'Instant Delivery', '7-Day Support'],
    },
    {
      id: 'coins-1000',
      name: '1000 Coins',
      description: 'Best seller - Best value',
      price: 34.99,
      currency: 'USD',
      icon: '💰',
      category: 'coins',
      bonus: 200,
      features: ['1000 In-Game Coins', '+200 Bonus Coins', 'Instant Delivery', 'Priority Support'],
    },
    {
      id: 'coins-5000',
      name: '5000 Coins',
      description: 'Premium mega pack',
      price: 149.99,
      currency: 'USD',
      icon: '💰',
      category: 'coins',
      bonus: 1000,
      features: ['5000 In-Game Coins', '+1000 Bonus Coins', 'Instant Delivery', 'VIP Support', 'Exclusive Cosmetics'],
    },
    // Premium Packages
    {
      id: 'premium-1month',
      name: 'Premium - 1 Month',
      description: 'Unlock premium features',
      price: 9.99,
      currency: 'USD',
      icon: '⭐',
      category: 'premium',
      features: ['Premium Tag', 'Special Prefix', '2x Coin Bonus', 'Early Access to New Items', 'Priority Support'],
    },
    {
      id: 'premium-3month',
      name: 'Premium - 3 Months',
      description: 'Long-term premium access',
      price: 24.99,
      currency: 'USD',
      icon: '⭐',
      category: 'premium',
      bonus: 2,
      highlighted: true,
      features: ['Premium Tag', 'Special Prefix', '3x Coin Bonus', 'Early Access to New Items', 'Priority Support', 'Exclusive Cosmetics'],
    },
    {
      id: 'premium-1year',
      name: 'Premium - 1 Year',
      description: 'Full year of premium benefits',
      price: 79.99,
      currency: 'USD',
      icon: '⭐',
      category: 'premium',
      bonus: 6,
      features: ['Premium Tag', 'Special Prefix', '4x Coin Bonus', 'Early Access to All Items', 'VIP Support', 'Exclusive Cosmetics & Skins'],
    },
    // Bundle Deals
    {
      id: 'bundle-starter',
      name: 'Starter Bundle',
      description: 'Perfect for new players',
      price: 29.99,
      currency: 'USD',
      icon: '📦',
      category: 'bundle',
      features: ['500 Coins', '1 Month Premium', 'Welcome Cosmetic', 'Instant Delivery'],
    },
    {
      id: 'bundle-ultimate',
      name: 'Ultimate Bundle',
      description: 'Everything you need',
      price: 89.99,
      currency: 'USD',
      icon: '📦',
      category: 'bundle',
      highlighted: true,
      features: ['2000 Coins', '3 Month Premium', 'Exclusive Cosmetics', 'VIP Features', 'Priority Support'],
    },
  ],
}