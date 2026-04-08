import React from 'react'

export default function CallButton({ phoneNumber, label }) {
    return (
        
            <a href={`tel:${phoneNumber}`} className="py-2 px-4 rounded-md hover:underline transition-colors">
                {label}
            </a>
        
    )
}
