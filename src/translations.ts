// Object containing all text translations for the application
export const translations = {
  // English translations
  en: {
    title: "Zemen Expense", // App title
    dashboard: "Dashboard", // Dashboard navigation label
    transactions: "Transactions", // Transactions navigation label
    addTransaction: "Add Transaction", // Button text to add a new record
    income: "Income", // Label for income type
    expense: "Expense", // Label for expense type
    amount: "Amount", // Label for monetary amount
    category: "Category", // Label for transaction category
    date: "Date", // Label for transaction date
    description: "Description", // Label for transaction notes
    source: "Source", // Label for payment source
    inCash: "InCash", // Label for cash payments
    digitalMoney: "Digital Money", // Label for digital payments
    selectSource: "Select Source", // Placeholder for source selection
    save: "Save", // Button text to save changes
    cancel: "Cancel", // Button text to discard changes
    edit: "Edit", // Button text to modify a record
    delete: "Delete", // Button text to remove a record
    totalBalance: "Total Balance", // Label for net balance
    totalIncome: "Total Income", // Label for sum of all income
    totalExpense: "Total Expense", // Label for sum of all expenses
    recentTransactions: "Recent Transactions", // Heading for the transaction list
    noTransactions: "No transactions found.", // Message when the list is empty
    downloadHistory: "Download History", // Button text to export data
    language: "Language", // Label for language setting
    theme: "Theme", // Label for theme setting
    passwordStrength: "Password Strength", // Label for password security indicator
    weak: "Weak", // Label for low password strength
    medium: "Medium", // Label for moderate password strength
    strong: "Strong", // Label for high password strength
    passwordRequirements: "Password must be at least 8 characters long.", // Password validation message
    allCategories: "All Categories", // Filter option for all categories
    filterByDate: "Filter by Date", // Label for date filtering
    spendingByCategory: "Spending by Category", // Heading for category chart
    incomeVsExpense: "Income vs Expense", // Heading for comparison chart
    monthlyTrend: "Monthly Trend", // Heading for trend chart
    ethiopianBanks: "Ethiopian Banks", // Group label for banks
    digitalWallets: "Digital Wallets", // Group label for digital wallets
    currency: "ETB", // Currency symbol for Ethiopian Birr
    // Category-specific translations
    categories: {
      Income: "Income",
      Salary: "Salary",
      "Side Hustle": "Side Hustle",
      Bonus: "Bonus",
      Gift: "Gift",
      Investment: "Investment",
      Food: "Food",
      Transport: "Transport",
      Rent: "Rent",
      Utilities: "Utilities",
      Shopping: "Shopping",
      Entertainment: "Entertainment",
      Health: "Health",
      Education: "Education",
      Other: "Other"
    },
    // Short month names for charts
    months: {
      Jan: "Jan",
      Feb: "Feb",
      Mar: "Mar",
      Apr: "Apr",
      May: "May",
      Jun: "Jun",
      Jul: "Jul",
      Aug: "Aug",
      Sep: "Sep",
      Oct: "Oct",
      Nov: "Nov",
      Dec: "Dec"
    },
    // Day names
    days: {
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
      Saturday: "Saturday",
      Sunday: "Sunday"
    },
    // Full month names
    fullMonths: {
      January: "January",
      February: "February",
      March: "March",
      April: "April",
      May: "May",
      June: "June",
      July: "July",
      August: "August",
      September: "September",
      October: "October",
      November: "November",
      December: "December"
    }
  },
  // Amharic translations (አማርኛ)
  am: {
    title: "Zemen Expense", // የአፕሊኬሽኑ ስም
    dashboard: "ዳሽቦርድ", // የዳሽቦርድ መለያ
    transactions: "ግብይቶች", // የግብይቶች መለያ
    addTransaction: "ግብይት ጨምር", // አዲስ ግብይት ለመጨመር
    income: "ገቢ", // የገቢ አይነት
    expense: "ወጪ", // የወጪ አይነት
    amount: "መጠን", // የገንዘብ መጠን
    category: "ምድብ", // የግብይት ምድብ
    date: "ቀን", // የግብይት ቀን
    description: "መግለጫ", // የግብይት ማብራሪያ
    source: "ምንጭ", // የክፍያ ምንጭ
    inCash: "በጥሬ ገንዘብ", // በጥሬ ገንዘብ ለሚደረግ ክፍያ
    digitalMoney: "ዲጂታል ገንዘብ", // በዲጂታል ለሚደረግ ክፍያ
    selectSource: "ምንጭ ይምረጡ", // ምንጭ ለመምረጥ
    save: "አስቀምጥ", // ለማስቀመጥ
    cancel: "ሰርዝ", // ለመሰረዝ
    edit: "አስተካክል", // ለማስተካከል
    delete: "አጥፋ", // ለማጥፋት
    totalBalance: "ጠቅላላ ቀሪ ሂሳብ", // ጠቅላላ ቀሪ ሂሳብ
    totalIncome: "ጠቅላላ ገቢ", // ጠቅላላ ገቢ
    totalExpense: "ጠቅላላ ወጪ", // ጠቅላላ ወጪ
    recentTransactions: "የቅርብ ጊዜ ግብይቶች", // የቅርብ ጊዜ ግብይቶች ዝርዝር
    noTransactions: "ምንም ግብይቶች አልተገኙም።", // ግብይቶች ሲጠፉ የሚታይ መልዕክት
    downloadHistory: "ታሪክ አውርድ", // ታሪክ ለማውረድ
    language: "ቋንቋ", // የቋንቋ ምርጫ
    theme: "ገጽታ", // የገጽታ ምርጫ
    passwordStrength: "የይለፍ ቃል ጥንካሬ", // የይለፍ ቃል ጥንካሬ መለያ
    weak: "ደካማ", // ደካማ የይለፍ ቃል
    medium: "መካከለኛ", // መካከለኛ የይለፍ ቃል
    strong: "ጠንካራ", // ጠንካራ የይለፍ ቃል
    passwordRequirements: "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት።", // የይለፍ ቃል መስፈርት
    allCategories: "ሁሉም ምድቦች", // ሁሉንም ምድቦች ለማየት
    filterByDate: "በቀን ይለዩ", // በቀን ለመለየት
    spendingByCategory: "ወጪ በምድብ", // ወጪ በምድብ የሚያሳይ ቻርት
    incomeVsExpense: "ገቢ እና ወጪ", // ገቢ እና ወጪ የሚያሳይ ቻርት
    monthlyTrend: "ወርሃዊ አዝማሚያ", // ወርሃዊ አዝማሚያ የሚያሳይ ቻርት
    ethiopianBanks: "የኢትዮጵያ ባንኮች", // የኢትዮጵያ ባንኮች ዝርዝር
    digitalWallets: "ዲጂታል ቦርሳዎች", // የዲጂታል ቦርሳዎች ዝርዝር
    currency: "ብር", // የኢትዮጵያ ብር ምልክት
    // የምድብ ትርጉሞች
    categories: {
      Income: "ገቢ",
      Salary: "ደመወዝ",
      "Side Hustle": "ተጨማሪ ስራ",
      Bonus: "ቦነስ",
      Gift: "ስጦታ",
      Investment: "ኢንቨስትመንት",
      Food: "ምግብ",
      Transport: "ትራንስፖርት",
      Rent: "ኪራይ",
      Utilities: "አገልግሎቶች",
      Shopping: "ግብይት",
      Entertainment: "መዝናኛ",
      Health: "ጤና",
      Education: "ትምህርት",
      Other: "ሌላ"
    },
    // አጭር የወራት ስሞች
    months: {
      Jan: "ጥር",
      Feb: "የካ",
      Mar: "መጋ",
      Apr: "ሚያ",
      May: "ግን",
      Jun: "ሰኔ",
      Jul: "ሐም",
      Aug: "ነሐ",
      Sep: "መስ",
      Oct: "ጥቅ",
      Nov: "ህዳ",
      Dec: "ታህ"
    },
    // የሳምንቱ ቀናት
    days: {
      Monday: "ሰኞ",
      Tuesday: "ማክሰኞ",
      Wednesday: "ረቡዕ",
      Thursday: "ሐሙስ",
      Friday: "አርብ",
      Saturday: "ቅዳሜ",
      Sunday: "እሁድ"
    },
    // ሙሉ የወራት ስሞች
    fullMonths: {
      January: "ጃንዋሪ",
      February: "ፌብሩዋሪ",
      March: "ማርች",
      April: "ኤፕሪል",
      May: "ሜይ",
      June: "ጁን",
      July: "ጁላይ",
      August: "ኦገስት",
      September: "ሴፕቴምበር",
      October: "ኦክቶበር",
      November: "ኖቬምበር",
      December: "ዲሴምበር"
    }
  }
};

// Exported type for supported languages
export type Language = 'en' | 'am';
