import { createRoute } from '@tanstack/react-router'
import Layout from '@/pages/@Admin/layout'
import AdminRoute from './admin.lazy'

// Courses
import CourseList from '@/pages/@Admin/Courses/Course/course_list'
import CourseForm from '@/pages/@Admin/Courses/Course/course_form'
import SectionForm from '@/pages/@Admin/Courses/Course/section_form'
import StepForm from '@/pages/@Admin/Courses/Course/step_form'

// // Categories
// import CategoryList from '@/pages/@Admin/Courses/Category/category_list'
// import CategoryForm from '@/pages/@Admin/Courses/Category/category_form'

// // Certificates
// import CertificateList from '@/pages/@Admin/Courses/Certificate/certificate_list'

// // Feedback
// import FeedbackList from '@/pages/@Admin/Courses/Feedback/feedback_list'

// // Approvals
// import PendingCourses from '@/pages/@Admin/Approvals/pending_courses'
// import ApprovedItems from '@/pages/@Admin/Approvals/approved_items'

// // Payments
// import InvoiceList from '@/pages/@Admin/Payments/Invoice/invoice_list'
// import InvoiceReceipt from '@/pages/@Admin/Payments/Invoice/invoice_receipt'
// import SystemAccountList from '@/pages/@Admin/Payments/System/systemaccount_list'
// import TransactionList from '@/pages/@Admin/Payments/Transaction/transaction_list'
// import WalletList from '@/pages/@Admin/Payments/Wallet/wallet_list'

// // Tickets
// import ReportList from '@/pages/@Admin/Tickets/Reports/report_list'

// // Users
// import UserList from '@/pages/@Admin/Users/User/user_list'
// import Landing from '@/pages/@Admin/landing'
// import UserForm from '@/pages/@Admin/Users/User/user_form'
export const Route = createRoute({
  getParentRoute: () => AdminRoute, // Reference to the parent admin route
  path: '/routes',
  component: Layout,
  children: [
    {
      path: '/',
      component: Landing
    },
    // Courses
    {
      path: 'courses',
      children: [
        {
          path: '/',
          component: CourseList
        },
        {
          path: 'new',
          component: CourseForm
        },
        {
          path: '$courseId',
          children: [
            {
              path: '/',
              component: CourseForm
            },
            {
              path: 'sections',
              children: [
                {
                  path: '/',
                  component: SectionForm
                },
                {
                  path: 'new',
                  component: SectionForm
                },
                {
                  path: '$sectionId',
                  component: SectionForm
                }
              ]
            },
            {
              path: 'steps',
              children: [
                {
                  path: '/',
                  component: StepForm
                },
                {
                  path: 'new',
                  component: StepForm
                },
                {
                  path: '$stepId',
                  component: StepForm
                }
              ]
            }
          ]
        }
      ]
    }
    // // Categories
    // {
    //   path: 'categories',
    //   children: [
    //     {
    //       path: '/',
    //       component: CategoryList
    //     },
    //     {
    //       path: 'new',
    //       component: CategoryForm
    //     },
    //     {
    //       path: '$categoryId',
    //       component: CategoryForm
    //     }
    //   ]
    // },
    // // Certificates
    // {
    //   path: 'certificates',
    //   component: CertificateList
    // },
    // // Feedback
    // {
    //   path: 'feedback',
    //   component: FeedbackList
    // },
    // // Approvals
    // {
    //   path: 'approvals',
    //   children: [
    //     {
    //       path: 'pending',
    //       component: PendingCourses
    //     },
    //     {
    //       path: 'approved',
    //       component: ApprovedItems
    //     }
    //   ]
    // },
    // // Payments
    // {
    //   path: 'payments',
    //   children: [
    //     {
    //       path: 'invoices',
    //       children: [
    //         {
    //           path: '/',
    //           component: InvoiceList
    //         },
    //         {
    //           path: '$invoiceId',
    //           component: InvoiceReceipt
    //         }
    //       ]
    //     },
    //     {
    //       path: 'system-accounts',
    //       component: SystemAccountList
    //     },
    //     {
    //       path: 'transactions',
    //       component: TransactionList
    //     },
    //     {
    //       path: 'wallets',
    //       component: WalletList
    //     }
    //   ]
    // },
    // // Tickets
    // {
    //   path: 'tickets',
    //   children: [
    //     {
    //       path: 'reports',
    //       component: ReportList
    //     }
    //   ]
    // },
    // // Users
    // {
    //   path: 'users',
    //   children: [
    //     {
    //       path: '/',
    //       component: UserList
    //     },
    //     {
    //       path: 'new',
    //       component: UserForm
    //     },
    //     {
    //       path: '$userId',
    //       component: UserForm
    //     }
    //   ]
    // }
  ]
})
