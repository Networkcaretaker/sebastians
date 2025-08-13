import React from 'react';

const DevMessage: React.FC = () => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <h3 className="font-medium text-red-700">This page is under development</h3>
            <p className="font-base text-gray-700">Some of the components on this page may not work as expected or may be dissabled</p>
        </div>
    );
}
export default DevMessage;