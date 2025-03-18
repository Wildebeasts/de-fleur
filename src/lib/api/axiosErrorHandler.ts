import { toast } from 'sonner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleAxiosError(error: any) {
  if (error.response) {
    // Server responded with an error status
    console.error('Response Error:', error.response)

    toast.error(error.response.data?.message || 'An error occurred!', {
      duration: 3000
    })

    return {
      success: false,
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    }
  } else if (error.request) {
    // No response received
    console.error('Request Error:', error.request)

    toast.error('No response from server. Please try again later.', {
      duration: 3000
    })

    return {
      success: false,
      message: 'No response from server. Please try again later.'
    }
  } else {
    // Other errors (e.g., network issues)
    console.error('General Error:', error.message)

    toast.error(error.message || 'Something went wrong', {
      duration: 3000
    })

    return {
      success: false,
      message: error.message || 'Something went wrong'
    }
  }
}
